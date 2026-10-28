import { useCallback, useEffect, useMemo, useRef, useState, startTransition, type CSSProperties, useId } from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { createPortal } from "react-dom"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"

// User request: replace procedural brain viewer with real GLB loading via Three.js runtime loader, keep existing UI/content, keep controls stable, add mapping + model controls, honest region mapping behavior.

type FontValue = {
    fontSize?: number | string
    lineHeight?: number | string
    letterSpacing?: number | string
    textAlign?: "left" | "center" | "right"
    fontFamily?: string
    fontWeight?: number
    fontStyle?: "normal" | "italic"
}

type RegionInfo = {
    id: string
    regionKey?: string
    numero: string
    nombre: string
    subtitulo: string
    descripcion: string
    ejemplo: string
}

interface MyComponentProps {
    style?: CSSProperties
    badgeText: string
    title: string
    introduction: string
    warningText: string
    background: string
    subtleBackground: string
    darkBackground: string
    primary: string
    tertiary: string
    accent: string
    headingFont: FontValue
    introFont: FontValue
    bodyFont: FontValue
    buttonFont: FontValue
    regiones: RegionInfo[]
    video1Url: string
    video1Title: string
    video2Url: string
    video2Title: string
    conceptosText: string
    casoText: string
    evaluacionText: string
    modelUrl: string
    modelRotationX: number
    modelRotationY: number
    modelRotationZ: number
    modelScaleFit: number
    dorsolateralMeshName: string
    orbitofrontalMeshName: string
    mediobasalMeshName: string
}

const canonicalKeys = ["dorsolateral", "orbitofrontal", "mediobasal"] as const

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

const colorCache = new Map<string, { r: number; g: number; b: number }>()

function parseColorToRgb(input: string): { r: number; g: number; b: number } {
    if (colorCache.has(input)) return colorCache.get(input)!
    const rgbRegex = input.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i)
    if (rgbRegex) {
        const parsed = { r: Number(rgbRegex[1]), g: Number(rgbRegex[2]), b: Number(rgbRegex[3]) }
        colorCache.set(input, parsed)
        return parsed
    }
    if (input.startsWith("#")) {
        const safe = input.replace("#", "")
        const normalized = safe.length === 3 ? safe.split("").map((c) => c + c).join("") : safe
        const num = Number.parseInt(normalized, 16)
        const parsed = { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
        colorCache.set(input, parsed)
        return parsed
    }
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        const probe = document.createElement("span")
        probe.style.color = input
        document.body.appendChild(probe)
        const computed = window.getComputedStyle(probe).color
        document.body.removeChild(probe)
        const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
        if (match) {
            const parsed = { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
            colorCache.set(input, parsed)
            return parsed
        }
    }
    const fallback = { r: 255, g: 255, b: 255 }
    colorCache.set(input, fallback)
    return fallback
}

function mixColor(a: string, b: string, t: number): string {
    const aa = parseColorToRgb(a)
    const bb = parseColorToRgb(b)
    const m = clamp(t, 0, 1)
    const r = Math.round(aa.r + (bb.r - aa.r) * m)
    const g = Math.round(aa.g + (bb.g - aa.g) * m)
    const bl = Math.round(aa.b + (bb.b - aa.b) * m)
    return `rgb(${r}, ${g}, ${bl})`
}

function resolveDropboxUrl(input: string): string {
    if (!input) return input
    try {
        const url = new URL(input)
        if (url.hostname.includes("dropbox.com") && url.pathname.startsWith("/scl/fi/")) {
            const rlkey = url.searchParams.get("rlkey")
            const next = new URL(`https://dl.dropboxusercontent.com${url.pathname}`)
            if (rlkey) next.searchParams.set("rlkey", rlkey)
            next.searchParams.set("raw", "1")
            return next.toString()
        }
        if (url.hostname.includes("dl.dropboxusercontent.com")) {
            const rlkey = url.searchParams.get("rlkey")
            const next = new URL(`https://dl.dropboxusercontent.com${url.pathname}`)
            if (rlkey) next.searchParams.set("rlkey", rlkey)
            next.searchParams.set("raw", "1")
            return next.toString()
        }
        return input
    } catch {
        return input
    }
}

function youtubeThumb(url: string): string {
    const idMatch = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    const id = idMatch?.[1] ?? "yrCPnNc-YJY"
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CerebroInteractivo(props: MyComponentProps) {
    const {
        style,
        badgeText,
        title,
        introduction,
        warningText,
        background,
        subtleBackground,
        darkBackground,
        primary,
        tertiary,
        accent,
        headingFont,
        introFont,
        bodyFont,
        buttonFont,
        regiones = [],
        video1Url,
        video1Title,
        video2Url,
        video2Title,
        conceptosText,
        casoText,
        evaluacionText,
        modelUrl = "https://dl.dropboxusercontent.com/scl/fi/x72nldls0fol5l3diwh4q/brain.glb?rlkey=8rtl767yy4hiabnuvtyfjut4f&raw=1",
        modelRotationX = 0,
        modelRotationY = 0,
        modelRotationZ = 0,
        modelScaleFit = 1,
        dorsolateralMeshName = "",
        orbitofrontalMeshName = "",
        mediobasalMeshName = "",
    } = props

    useIsStaticRenderer()
    const rootRef = useRef<HTMLDivElement | null>(null)
    const viewerRef = useRef<HTMLDivElement | null>(null)
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const rendererHostRef = useRef<HTMLDivElement | null>(null)
    const closeModalRef = useRef<HTMLButtonElement | null>(null)
    const restoreFocusRef = useRef<HTMLElement | null>(null)
    const threeRef = useRef<any>(null)
    const animationRef = useRef<number | null>(null)
    const activeRegionRef = useRef<string | null>(null)
    const pointerRef = useRef({ downX: 0, downY: 0, moved: false })
    const dialogId = useId()
    const dialogTitleId = useId()

    const [layoutWidth, setLayoutWidth] = useState(960)
    const [canvasSize, setCanvasSize] = useState({ w: 820, h: 540 })
    const canvasSizeRef = useRef(canvasSize)
    const [zoom, setZoom] = useState(1.1)
    const [activeRegion, setActiveRegion] = useState<string | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [openAccordions, setOpenAccordions] = useState<string[]>(["conceptos"])
    const [embedVideo1, setEmbedVideo1] = useState(false)
    const [embedVideo2, setEmbedVideo2] = useState(false)
    const [loadingModel, setLoadingModel] = useState(true)
    const [modelError, setModelError] = useState("")
    const [mappedRegionAvailable, setMappedRegionAvailable] = useState(false)
    const [retryCount, setRetryCount] = useState(0)

    const regionMap = useMemo(() => {
        const fallback: RegionInfo[] = [
            {
                id: "dorsolateral",
                numero: "1",
                nombre: "Prefrontal dorsolateral",
                subtitulo: "Parte superior lateral anterior",
                descripcion:
                    "Se asocia a planificación, memoria de trabajo, flexibilidad cognitiva y control por contexto. En síndrome disejecutivo puede verse perseveración y dificultad para cambiar de estrategia.",
                ejemplo: "Ejemplo: repetir una estrategia ineficaz pese a retroalimentación negativa.",
            },
            {
                id: "orbitofrontal",
                numero: "2",
                nombre: "Orbitofrontal",
                subtitulo: "Parte inferior anterior",
                descripcion:
                    "Participa en inhibición y evaluación contextual de respuestas sociales. Puede aparecer desinhibición, impulsividad y respuestas inapropiadas para el contexto.",
                ejemplo: "El descriptor 'seudopsicopático' es histórico-descriptivo y no un juicio moral.",
            },
            {
                id: "mediobasal",
                numero: "3",
                nombre: "Mediobasal / Cingular",
                subtitulo: "Superficie medial frontal",
                descripcion:
                    "Involucrada en supervisión atencional, toma de decisiones y aspectos de memoria emocional. Requiere vista medial o separación de hemisferios para exploración visual.",
                ejemplo: "Puede comprometer el monitoreo de objetivos y la selección de acciones.",
            },
        ]
        const safe = regiones.length >= 3 ? regiones : fallback
        return safe.reduce<Record<string, RegionInfo>>((acc, r, index) => {
            const source = (r.regionKey || r.id || "").toLowerCase()
            const preferred = canonicalKeys[index] || canonicalKeys[0]
            const fromSource = canonicalKeys.includes(source as any) ? source : preferred
            const key = acc[fromSource] ? preferred : fromSource
            acc[key] = r
            return acc
        }, {})
    }, [regiones])

    useEffect(() => {
        if (!rootRef.current || typeof window === "undefined") return
        const target = rootRef.current
        const obs = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            const nextW = Math.max(320, Math.floor(entry.contentRect.width))
            startTransition(() => setLayoutWidth(nextW))
        })
        obs.observe(target)
        return () => obs.disconnect()
    }, [])

    useEffect(() => {
        activeRegionRef.current = activeRegion
    }, [activeRegion])

    useEffect(() => {
        canvasSizeRef.current = canvasSize
    }, [canvasSize])

    useEffect(() => {
        if (!viewerRef.current || !viewportRef.current || !rendererHostRef.current || typeof window === "undefined") return
        let cancelled = false

        let resizeObserver: ResizeObserver | null = null
        let domCleanup = () => {}
        const cleanup = () => {
            domCleanup()
            if (resizeObserver) resizeObserver.disconnect()
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            animationRef.current = null
            const inst = threeRef.current
            if (!inst) return
            try {
                inst.controls?.dispose?.()
                inst.scene?.traverse?.((obj: any) => {
                    if (obj?.geometry?.dispose) obj.geometry.dispose()
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
                    mats.forEach((mat: any) => {
                        if (!mat) return
                        Object.keys(mat).forEach((key) => {
                            const tex = mat[key]
                            if (tex && typeof tex.dispose === "function") tex.dispose()
                        })
                        if (typeof mat.dispose === "function") mat.dispose()
                    })
                })
                inst.renderer?.dispose?.()
                inst.renderer?.domElement?.remove?.()
            } catch {}
            threeRef.current = null
        }

        cleanup()
        startTransition(() => {
            setLoadingModel(true)
            setModelError("")
        })

        const launch = async () => {
            try {
                const THREE: any = await importFromUrl("https://esm.sh/three@0.160.0")
                const { OrbitControls }: any = await importFromUrl(
                    "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js"
                )
                const { GLTFLoader }: any = await importFromUrl(
                    "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js"
                )
                if (cancelled || !viewportRef.current) return

                const rect = viewerRef.current.getBoundingClientRect()
                const initialW = Math.max(300, Math.floor(rect.width) || canvasSizeRef.current.w)
                const initialH = initialW > 860 ? 560 : initialW > 640 ? 500 : 420
                if (initialW !== canvasSizeRef.current.w || initialH !== canvasSizeRef.current.h) {
                    startTransition(() => setCanvasSize({ w: initialW, h: initialH }))
                }

                const scene = new THREE.Scene()
                const camera = new THREE.PerspectiveCamera(42, initialW / initialH, 0.01, 200)
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
                renderer.setPixelRatio(window.devicePixelRatio || 1)
                renderer.outputColorSpace = THREE.SRGBColorSpace
                renderer.setSize(initialW, initialH)
                renderer.domElement.style.width = "100%"
                renderer.domElement.style.height = `${initialH}px`
                renderer.domElement.style.display = "block"
                renderer.domElement.style.outline = "none"
                renderer.domElement.tabIndex = 0
                if (!rendererHostRef.current) {
                    const host = document.createElement("div")
                    host.style.width = "100%"
                    host.style.height = "100%"
                    host.style.position = "relative"
                    rendererHostRef.current = host
                    viewportRef.current.appendChild(host)
                }
                rendererHostRef.current.replaceChildren(renderer.domElement)

                const controls = new OrbitControls(camera, renderer.domElement)
                controls.enableDamping = true
                controls.dampingFactor = 0.08
                threeRef.current = { scene, camera, renderer, controls, root: null }

                scene.add(new THREE.AmbientLight(0xffffff, 0.9))
                const key = new THREE.DirectionalLight(0xffffff, 1)
                key.position.set(2, 3, 2)
                scene.add(key)
                const fill = new THREE.DirectionalLight(0xdfffd2, 0.4)
                fill.position.set(-2, 1.4, -1.2)
                scene.add(fill)

                const loader = new GLTFLoader()
                const { DRACOLoader }: any = await importFromUrl(
                    "https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js"
                )
                const draco = new DRACOLoader()
                draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")
                loader.setDRACOLoader(draco)
                const loadPromise = loader.loadAsync(resolveDropboxUrl(modelUrl))
                const timeoutPromise = new Promise((_, reject) =>
                    window.setTimeout(() => reject(new Error("Tiempo de espera agotado (25s) al cargar el modelo.")), 25000)
                )
                const gltf = (await Promise.race([loadPromise, timeoutPromise])) as any
                if (cancelled) return
                draco.dispose()
                const root = gltf.scene
                const modelGroup = new THREE.Group()
                modelGroup.rotation.set(modelRotationX, modelRotationY, modelRotationZ)
                modelGroup.add(root)
                scene.add(modelGroup)

                const box = new THREE.Box3().setFromObject(root)
                const sizeV = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())
                const maxDim = Math.max(sizeV.x, sizeV.y, sizeV.z, 0.001)
                const fit = (1.65 / maxDim) * clamp(modelScaleFit, 0.2, 4)
                modelGroup.scale.setScalar(fit)
                root.position.copy(center.multiplyScalar(-fit))
                const sphere = new THREE.Box3().setFromObject(modelGroup).getBoundingSphere(new THREE.Sphere())
                controls.target.copy(sphere.center)
                camera.position.set(sphere.center.x + sphere.radius * 1.9, sphere.center.y + sphere.radius * 0.4, sphere.center.z + sphere.radius * 2.2)
                controls.update()
                controls.saveState()

                const norm = (v: string) => (v || "").trim().toLowerCase()
                const map: Record<string, string> = {}
                if (dorsolateralMeshName.trim()) map[norm(dorsolateralMeshName)] = "dorsolateral"
                if (orbitofrontalMeshName.trim()) map[norm(orbitofrontalMeshName)] = "orbitofrontal"
                if (mediobasalMeshName.trim()) map[norm(mediobasalMeshName)] = "mediobasal"
                const selectable: any[] = []
                const regionMeshes: Record<string, any[]> = { dorsolateral: [], orbitofrontal: [], mediobasal: [] }
                const foundNames: string[] = []
                root.traverse((obj: any) => {
                    if (!obj?.isMesh) return
                    selectable.push(obj)
                    if (obj.name) foundNames.push(obj.name)
                    const keyName = norm(obj.name)
                    const region = map[keyName]
                    if (region) regionMeshes[region].push(obj)
                })
                console.info("CerebroInteractivo mesh names:", Array.from(new Set(foundNames)))
                startTransition(() => {
                    setMappedRegionAvailable(Object.values(regionMeshes).some((v) => v.length > 0))
                })

                const raycaster = new THREE.Raycaster()
                const pointer = new THREE.Vector2()
                const baseEmissive = new Map<any, any>()
                Object.values(regionMeshes).flat().forEach((mesh) => {
                    if (mesh.material?.emissive) baseEmissive.set(mesh, mesh.material.emissive.clone())
                })

                const onPointerDown = (ev: PointerEvent) => {
                    pointerRef.current = { downX: ev.clientX, downY: ev.clientY, moved: false }
                    restoreFocusRef.current = renderer.domElement
                }
                const onPointerMove = (ev: PointerEvent) => {
                    if (Math.hypot(ev.clientX - pointerRef.current.downX, ev.clientY - pointerRef.current.downY) > 5) {
                        pointerRef.current.moved = true
                    }
                }
                const onPointerUp = (ev: PointerEvent) => {
                    if (pointerRef.current.moved) return
                    const rect = renderer.domElement.getBoundingClientRect()
                    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
                    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
                    raycaster.setFromCamera(pointer, camera)
                    const hit = raycaster.intersectObjects(selectable, true)[0]
                    if (!hit?.object) return
                    const region = map[norm(hit.object.name || "")]
                    if (region && canonicalKeys.includes(region as any)) {
                        startTransition(() => {
                            setActiveRegion(region)
                            setOpenDialog(true)
                        })
                    }
                }
                renderer.domElement.addEventListener("pointerdown", onPointerDown)
                renderer.domElement.addEventListener("pointermove", onPointerMove)
                renderer.domElement.addEventListener("pointerup", onPointerUp)

                const tick = () => {
                    if (cancelled) return
                    Object.entries(regionMeshes).forEach(([region, list]) => {
                        list.forEach((mesh) => {
                            const mat = mesh.material
                            if (!mat?.emissive) return
                            const base = baseEmissive.get(mesh)
                            if (base) mat.emissive.copy(base)
                            if (activeRegionRef.current === region) mat.emissive.setRGB(0.14, 0.25, 0.14)
                        })
                    })
                    controls.update()
                    renderer.render(scene, camera)
                    animationRef.current = requestAnimationFrame(tick)
                }
                tick()

                threeRef.current = { scene, camera, renderer, controls, root: modelGroup }
                startTransition(() => setLoadingModel(false))

                resizeObserver = new ResizeObserver((entries) => {
                    const entry = entries[0]
                    if (!entry) return
                    const nextW = Math.max(300, Math.floor(entry.contentRect.width))
                    const nextH = nextW > 860 ? 560 : nextW > 640 ? 500 : 420
                    if (nextW !== canvasSizeRef.current.w || nextH !== canvasSizeRef.current.h) {
                        startTransition(() => setCanvasSize({ w: nextW, h: nextH }))
                    }
                    camera.aspect = nextW / nextH
                    camera.updateProjectionMatrix()
                    renderer.setSize(nextW, nextH)
                    renderer.domElement.style.height = `${nextH}px`
                })
                resizeObserver.observe(viewerRef.current as Element)
                domCleanup = () => {
                    renderer.domElement.removeEventListener("pointerdown", onPointerDown)
                    renderer.domElement.removeEventListener("pointermove", onPointerMove)
                    renderer.domElement.removeEventListener("pointerup", onPointerUp)
                }
            } catch (err: any) {
                if (cancelled) return
                startTransition(() => {
                    setLoadingModel(false)
                    setModelError(err?.message || "No se pudo cargar el GLB/GLTF.")
                })
            }
        }
        launch()
        return () => {
            cancelled = true
            cleanup()
        }
    }, [
        dorsolateralMeshName,
        mediobasalMeshName,
        modelRotationX,
        modelRotationY,
        modelRotationZ,
        modelScaleFit,
        modelUrl,
        orbitofrontalMeshName,
        retryCount,
    ])

    useEffect(() => {
        const inst = threeRef.current
        if (!inst) return
        const dist = 2.6 / clamp(zoom, 0.6, 2.2)
        const dir = inst.camera.position.clone().sub(inst.controls.target).normalize()
        inst.camera.position.copy(inst.controls.target.clone().add(dir.multiplyScalar(dist)))
        inst.controls.update()
    }, [zoom])

    const resetView = useCallback(() => {
        const inst = threeRef.current
        if (inst) {
            inst.root.rotation.set(modelRotationX, modelRotationY, modelRotationZ)
            inst.controls.reset()
        }
        startTransition(() => setZoom(1.1))
    }, [modelRotationX, modelRotationY, modelRotationZ])

    const openRegion = useCallback((regionId: string, focusTarget?: HTMLElement | null) => {
        restoreFocusRef.current = focusTarget ?? null
        startTransition(() => {
            setActiveRegion(regionId)
            setOpenDialog(true)
        })
    }, [])

    const closeRegion = useCallback(() => {
        startTransition(() => {
            setOpenDialog(false)
            setEmbedVideo1(false)
            setEmbedVideo2(false)
        })
        if (restoreFocusRef.current) restoreFocusRef.current.focus()
    }, [])

    useEffect(() => {
        if (!openDialog || typeof document === "undefined") return
        const keyHandler = (ev: KeyboardEvent) => {
            if (ev.key === "Escape") {
                ev.preventDefault()
                closeRegion()
                return
            }
            if (ev.key !== "Tab") return
            const root = document.getElementById(dialogId)
            if (!root) return
            const focusables = Array.from(
                root.querySelectorAll<HTMLElement>('button, a[href], iframe, [tabindex]:not([tabindex="-1"])')
            ).filter((el) => !el.hasAttribute("disabled"))
            if (focusables.length === 0) return
            const first = focusables[0]
            const last = focusables[focusables.length - 1]
            const current = document.activeElement
            if (ev.shiftKey && current === first) {
                ev.preventDefault()
                last.focus()
            } else if (!ev.shiftKey && current === last) {
                ev.preventDefault()
                first.focus()
            }
        }
        document.addEventListener("keydown", keyHandler)
        closeModalRef.current?.focus()
        return () => document.removeEventListener("keydown", keyHandler)
    }, [closeRegion, dialogId, openDialog])

    const activeInfo = activeRegion ? regionMap[activeRegion] : null

    const renderVideoCard = (titleText: string, videoUrl: string, embedded: boolean, setEmbedded: (v: boolean) => void) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${darkBackground}`, borderRadius: 12, padding: 10 }}>
            <strong style={{ color: primary, ...(bodyFont as CSSProperties) }}>{titleText}</strong>
            {embedded ? (
                <iframe
                    title={titleText}
                    src={`https://www.youtube-nocookie.com/embed/${(videoUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? "").trim()}`}
                    style={{ width: "100%", minHeight: 180, border: "none", borderRadius: 10 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <a href={videoUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <img src={youtubeThumb(videoUrl)} alt={`Miniatura de ${titleText}`} style={{ width: "100%", borderRadius: 10, border: `1px solid ${darkBackground}` }} />
                </a>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                    onClick={() => startTransition(() => setEmbedded(true))}
                    style={{ borderRadius: 999, border: `1px solid ${accent}`, background: "transparent", color: primary, padding: "7px 12px", cursor: "pointer", ...(buttonFont as CSSProperties) }}
                >
                    Cargar aquí (consentimiento)
                </button>
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ borderRadius: 999, border: `1px solid ${darkBackground}`, color: primary, padding: "7px 12px", textDecoration: "none", ...(buttonFont as CSSProperties) }}
                >
                    Abrir en YouTube
                </a>
            </div>
        </div>
    )

    const panelBase: CSSProperties = {
        border: `1px solid ${darkBackground}`,
        borderRadius: 16,
        background: "rgba(255,255,255,0.01)",
        padding: 18,
    }

    return (
        <div ref={rootRef} style={{ ...style, position: "relative", width: "100%", minHeight: "max-content", display: "flex", flexDirection: "column", gap: 16, background, color: primary, padding: 20, boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}>
            <header style={{ ...panelBase, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ color: tertiary, letterSpacing: 1.3, fontSize: 12 }}>NEURO / EXPLORADOR INTERACTIVO</span>
                    <span style={{ border: `1px solid ${accent}`, color: accent, borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{badgeText}</span>
                </div>
                <h1 style={{ margin: 0, color: primary, ...(headingFont as CSSProperties), fontSize: `clamp(32px, 7vw, ${typeof headingFont.fontSize === "number" ? `${headingFont.fontSize}px` : headingFont.fontSize || "48px"})` }}>{title}</h1>
                <p style={{ margin: 0, color: mixColor(primary, tertiary, 0.45), ...(introFont as CSSProperties) }}>{introduction}</p>
            </header>

            <section style={{ display: "grid", gridTemplateColumns: layoutWidth > 940 ? "minmax(0,1.45fr) minmax(0,0.85fr)" : "minmax(0,1fr)", gap: 16 }}>
                <div ref={viewerRef} style={{ ...panelBase, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
                        <strong style={{ ...(bodyFont as CSSProperties) }}>Modelo frontal aproximado (educativo)</strong>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button onClick={resetView} style={{ border: `1px solid ${darkBackground}`, background: "transparent", color: primary, borderRadius: 999, padding: "6px 10px", cursor: "pointer", ...(buttonFont as CSSProperties) }}>
                                Reset vista
                            </button>
                        </div>
                    </div>
                    <div ref={viewportRef} aria-label="Modelo cerebral 3D interactivo" style={{ width: "100%", height: canvasSize.h, borderRadius: 12, border: `1px solid ${darkBackground}`, background: subtleBackground, overflow: "hidden", position: "relative" }}>
                        {loadingModel ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: tertiary, ...(bodyFont as CSSProperties) }}>Cargando modelo GLB…</div> : null}
                        {modelError ? <div style={{ position: "absolute", inset: 12, background: "rgba(0,0,0,0.45)", border: `1px solid ${darkBackground}`, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8, color: primary, ...(buttonFont as CSSProperties) }}><strong>No se pudo cargar el modelo.</strong><span style={{ color: tertiary }}>{modelError}</span><a href={resolveDropboxUrl(modelUrl)} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: "underline" }}>Abrir URL del modelo</a><button onClick={() => startTransition(() => setRetryCount((n) => n + 1))} style={{ borderRadius: 999, border: `1px solid ${accent}`, background: "transparent", color: primary, padding: "6px 10px", cursor: "pointer", ...(buttonFont as CSSProperties) }}>Reintentar</button></div> : null}
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ minWidth: 56, ...(bodyFont as CSSProperties) }}>Zoom</span>
                        <input
                            type="range"
                            min={0.8}
                            max={1.35}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => startTransition(() => setZoom(Number(e.target.value)))}
                            style={{ flex: 1, accentColor: accent }}
                            aria-label="Control de zoom"
                        />
                    </label>
                    <div style={{ color: tertiary, ...(buttonFont as CSSProperties) }}>{mappedRegionAvailable ? "Regiones mapeadas por nombre de malla activas." : "Modelo sin regiones identificadas. Usa el panel para explorar la información."}</div>
                    <div style={{ color: mixColor(primary, tertiary, 0.3), ...(buttonFont as CSSProperties) }}>Si defines nombres de malla por región en controles, el clic en el modelo abrirá la región correspondiente.</div>
                </div>

                <aside style={{ ...panelBase, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                    <h2 style={{ margin: 0, ...(bodyFont as CSSProperties) }}>Explora las regiones</h2>
                    {(canonicalKeys as readonly string[]).map((id, index) => {
                        const info = regionMap[id]
                        return (
                            <button
                                key={id}
                                onClick={(e) => openRegion(id, e.currentTarget)}
                                style={{
                                    textAlign: "left",
                                    borderRadius: 14,
                                    border: `1px solid ${activeRegion === id ? accent : darkBackground}`,
                                    background: activeRegion === id ? "rgba(165,243,104,0.11)" : "transparent",
                                    color: primary,
                                    padding: 12,
                                    cursor: "pointer",
                                    display: "flex",
                                    gap: 10,
                                }}
                            >
                                <span style={{ width: 24, height: 24, borderRadius: "50%", background: accent, color: "#0A120E", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                                    {info?.numero ?? String(index + 1)}
                                </span>
                                <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <strong style={{ ...(bodyFont as CSSProperties) }}>{info?.nombre ?? id}</strong>
                                    <span style={{ color: tertiary, ...(buttonFont as CSSProperties) }}>{info?.subtitulo ?? ""}</span>
                                </span>
                            </button>
                        )
                    })}
                    <div style={{ borderTop: `1px solid ${darkBackground}`, paddingTop: 10, color: mixColor(primary, tertiary, 0.35), ...(bodyFont as CSSProperties) }}>
                        <strong>Resumen ejecutivo:</strong> conjunto de cambios cognitivos, conductuales y motores asociados a circuitos frontales (especialmente prefrontales), con variabilidad clínica entre pacientes.
                    </div>
                </aside>
            </section>

            <section style={{ ...panelBase, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                    ["conceptos", "Conceptos", conceptosText],
                    ["caso", "Caso clínico", casoText],
                    ["evaluacion", "Evaluación y fuentes", evaluacionText],
                ].map(([key, label, text]) => {
                    const open = openAccordions.includes(key)
                    return (
                        <div key={key} style={{ border: `1px solid ${darkBackground}`, borderRadius: 12, overflow: "hidden" }}>
                            <button
                                onClick={() =>
                                    startTransition(() =>
                                        setOpenAccordions((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
                                    )
                                }
                                style={{ width: "100%", textAlign: "left", border: "none", background: "rgba(255,255,255,0.02)", color: primary, padding: "10px 12px", cursor: "pointer", ...(bodyFont as CSSProperties) }}
                            >
                                {label}
                            </button>
                            {open ? <div style={{ padding: 12, color: mixColor(primary, tertiary, 0.3), ...(bodyFont as CSSProperties), whiteSpace: "pre-wrap" }}>{text}</div> : null}
                        </div>
                    )
                })}
            </section>

            <footer style={{ color: tertiary, ...(buttonFont as CSSProperties) }}>{warningText}</footer>

            {openDialog && activeInfo && typeof document !== "undefined"
                ? createPortal(
                    <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeRegion()
                    }}
                    style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(8,13,11,0.74)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
                    aria-hidden={false}
                >
                    <div
                        id={dialogId}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={dialogTitleId}
                        style={{ width: "min(1040px, 100%)", maxHeight: "92vh", overflow: "auto", background: background, border: `1px solid ${darkBackground}`, borderRadius: 18, padding: 16, display: "grid", gridTemplateColumns: layoutWidth > 860 ? "1fr 1fr" : "1fr", gap: 14, color: primary, fontFamily: "Inter, sans-serif" }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <h3 id={dialogTitleId} style={{ margin: 0, ...(headingFont as CSSProperties), fontSize: "28px", lineHeight: "1.1em" }}>
                                    {activeInfo.numero}. {activeInfo.nombre}
                                </h3>
                                <button
                                    ref={closeModalRef}
                                    onClick={closeRegion}
                                    style={{ border: `1px solid ${darkBackground}`, background: "transparent", color: primary, borderRadius: 999, padding: "6px 11px", cursor: "pointer", ...(buttonFont as CSSProperties) }}
                                >
                                    Cerrar
                                </button>
                            </div>
                            <p style={{ margin: 0, color: tertiary, ...(buttonFont as CSSProperties) }}>{activeInfo.subtitulo}</p>
                            <p style={{ margin: 0, ...(bodyFont as CSSProperties) }}>{activeInfo.descripcion}</p>
                            <p style={{ margin: 0, color: mixColor(primary, tertiary, 0.35), ...(bodyFont as CSSProperties) }}>{activeInfo.ejemplo}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {renderVideoCard(video1Title, video1Url, embedVideo1, setEmbedVideo1)}
                            {renderVideoCard(video2Title, video2Url, embedVideo2, setEmbedVideo2)}
                        </div>
                    </div>
                </div>,
                    document.body
                )
                : null}
        </div>
    )
}

addPropertyControls(CerebroInteractivo, {
    badgeText: {
        type: ControlType.String,
        title: "Etiqueta",
        defaultValue: "Educación médica",
    },
    title: {
        type: ControlType.String,
        title: "Título",
        defaultValue: "Síndrome disejecutivo",
    },
    introduction: {
        type: ControlType.String,
        title: "Introducción",
        displayTextArea: true,
        defaultValue:
            "El síndrome disejecutivo es un conjunto de alteraciones cognitivas, conductuales y motoras relacionadas con circuitos frontales, especialmente prefrontales. Este modelo interactivo es una aproximación anatómica educativa: no reemplaza evaluación clínica.",
    },
    warningText: {
        type: ControlType.String,
        title: "Aviso",
        defaultValue: "Material educativo. No constituye diagnóstico ni indicación terapéutica.",
    },
    background: { type: ControlType.Color, title: "Fondo", defaultValue: "#080D0B" },
    subtleBackground: { type: ControlType.Color, title: "Fondo Suave", defaultValue: "#101A14" },
    darkBackground: { type: ControlType.Color, title: "Borde", defaultValue: "#25392D" },
    tertiary: { type: ControlType.Color, title: "Terciario", defaultValue: "#CCCCCC" },
    primary: { type: ControlType.Color, title: "Primario", defaultValue: "#F5F8F4" },
    accent: { type: ControlType.Color, title: "Acento", defaultValue: "#A5F368" },
    headingFont: {
        type: ControlType.Font,
        title: "Fuente Título",
        defaultValue: { fontSize: "48px", variant: "Bold", letterSpacing: "-0.04em", lineHeight: "1em" },
        controls: "extended",
        defaultFontType: "sans-serif",
    },
    introFont: {
        type: ControlType.Font,
        title: "Fuente Intro",
        defaultValue: { fontSize: "15px", variant: "Medium", letterSpacing: "-0.01em", lineHeight: "1.3em" },
        controls: "extended",
        defaultFontType: "sans-serif",
    },
    bodyFont: {
        type: ControlType.Font,
        title: "Fuente Cuerpo",
        defaultValue: { fontSize: "15px", variant: "Medium", letterSpacing: "-0.01em", lineHeight: "1.3em" },
        controls: "extended",
        defaultFontType: "sans-serif",
    },
    buttonFont: {
        type: ControlType.Font,
        title: "Fuente Botón",
        defaultValue: { fontSize: "14px", variant: "Semibold", letterSpacing: "-0.01em", lineHeight: "1em" },
        controls: "extended",
        defaultFontType: "sans-serif",
    },
    regiones: {
        type: ControlType.Array,
        title: "Regiones",
        control: {
            type: ControlType.Object,
            controls: {
                regionKey: {
                    type: ControlType.Enum,
                    options: ["dorsolateral", "orbitofrontal", "mediobasal"],
                    optionTitles: ["Dorsolateral", "Orbitofrontal", "Mediobasal"],
                    defaultValue: "dorsolateral",
                },
                id: { type: ControlType.Enum, options: ["dorsolateral", "orbitofrontal", "mediobasal"], optionTitles: ["Dorsolateral", "Orbitofrontal", "Mediobasal"], defaultValue: "dorsolateral" },
                numero: { type: ControlType.String, defaultValue: "1" },
                nombre: { type: ControlType.String, defaultValue: "Prefrontal dorsolateral" },
                subtitulo: { type: ControlType.String, defaultValue: "Parte superior lateral anterior" },
                descripcion: { type: ControlType.String, displayTextArea: true, defaultValue: "Descripción" },
                ejemplo: { type: ControlType.String, displayTextArea: true, defaultValue: "Ejemplo clínico breve." },
            },
        },
        defaultValue: [
            {
                id: "dorsolateral",
                numero: "1",
                nombre: "Prefrontal dorsolateral",
                subtitulo: "Parte superior lateral anterior",
                descripcion:
                    "Asociado a flexibilidad cognitiva, memoria de trabajo y control por contexto. Puede observarse perseveración y dificultad para actualizar estrategias.",
                ejemplo: "Perfil seudodepresivo descrito en literatura clínica (p. ej., Samudio et al., 2019).",
            },
            {
                id: "orbitofrontal",
                numero: "2",
                nombre: "Orbitofrontal",
                subtitulo: "Parte inferior anterior",
                descripcion:
                    "Relacionado con inhibición conductual y ajuste social contextual. Puede haber desinhibición, impulsividad y respuestas pueriles/egocéntricas.",
                ejemplo: "“Seudopsicopático” es descriptor histórico y no juicio moral.",
            },
            {
                id: "mediobasal",
                numero: "3",
                nombre: "Mediobasal / Cingular",
                subtitulo: "Superficie medial frontal",
                descripcion:
                    "Participa en supervisión atencional, memoria emocional y decisiones. Su visualización mejora al separar hemisferios (vista medial).",
                ejemplo: "No implica causalidad única para apatía u otros signos aislados.",
            },
        ],
        maxCount: 6,
    },
    video1Url: {
        type: ControlType.Link,
        title: "Video 1 URL",
        defaultValue: "https://www.youtube.com/watch?v=yrCPnNc-YJY",
    },
    video1Title: {
        type: ControlType.String,
        title: "Video 1 título",
        defaultValue: "Síndrome disejecutivo",
    },
    video2Url: {
        type: ControlType.Link,
        title: "Video 2 URL",
        defaultValue: "https://www.youtube.com/watch?v=o4Vpj6Zkfuc",
    },
    video2Title: {
        type: ControlType.String,
        title: "Video 2 título",
        defaultValue: "Funciones ejecutivas y síndrome disejecutivo",
    },
    conceptosText: {
        type: ControlType.String,
        title: "Conceptos",
        displayTextArea: true,
        defaultValue:
            "Funciones ejecutivas: planificación, definición de metas, flexibilidad, inhibición, actualización de memoria de trabajo, supervisión y toma de decisiones.\n\nSignos posibles (no universales): irritabilidad, agresividad, desinhibición, apatía, abulia, acinesia/mutismo acinético, agitación, coprolalia, lagunas mnésicas y alteración de la marcha.\n\nCausas frecuentes: traumatismos, enfermedades degenerativas y tumores.",
    },
    casoText: {
        type: ControlType.String,
        title: "Caso",
        displayTextArea: true,
        defaultValue:
            "Caso Samudio Domínguez et al. (2019): adolescente de 14 años tras accidente de tránsito, inicialmente sin pérdida de conciencia ni déficit motor/sensitivo. A los ~15 días presentó abulia, irritabilidad, mutismo acinético, alteración de memoria, marcha y agresividad; luego agitación, coprolalia y ataxia. Neuroimagen: microcontusiones hemorrágicas bifrontales/biparietales y otras lesiones, además de higroma subdural frontal bilateral progresivo con efecto de masa. Trepanación/drenaje con mejoría parcial: no todos los signos se atribuyen únicamente al higroma.",
    },
    evaluacionText: {
        type: ControlType.String,
        title: "Evaluación/Fuentes",
        displayTextArea: true,
        defaultValue:
            "Evaluación clínica: cronología de síntomas, observaciones familiares, estado cognitivo y conductual, examen motor y de marcha, y estudios de imagen cuando estén indicados.\n\nFuentes:\n• Samudio Domínguez et al. (2019). Pediatría Asunción, 46(3), 204–208. https://doi.org/10.31698/ped.46032019009\n• Mujica-Alfonzo (2011). Revista Chilena de Neuropsicología, 6(1), 7–11. http://www.redalyc.org/articulo.oa?id=17932253300\n\nPerspectiva general neuropsiquiátrica; contenido educativo, no diagnóstico.",
    },
    modelUrl: {
        type: ControlType.String,
        title: "Model URL",
        defaultValue:
            "https://dl.dropboxusercontent.com/scl/fi/x72nldls0fol5l3diwh4q/brain.glb?rlkey=8rtl767yy4hiabnuvtyfjut4f&raw=1",
    },
    modelRotationX: { type: ControlType.Number, title: "Rot X", min: -3.14, max: 3.14, step: 0.01, defaultValue: 0 },
    modelRotationY: { type: ControlType.Number, title: "Rot Y", min: -3.14, max: 3.14, step: 0.01, defaultValue: 0 },
    modelRotationZ: { type: ControlType.Number, title: "Rot Z", min: -3.14, max: 3.14, step: 0.01, defaultValue: 0 },
    modelScaleFit: { type: ControlType.Number, title: "Escala 3D", min: 0.2, max: 4, step: 0.01, defaultValue: 1 },
    dorsolateralMeshName: { type: ControlType.String, title: "Malla DLPFC", defaultValue: "" },
    orbitofrontalMeshName: { type: ControlType.String, title: "Malla OFC", defaultValue: "" },
    mediobasalMeshName: { type: ControlType.String, title: "Malla Cingular", defaultValue: "" },
})
