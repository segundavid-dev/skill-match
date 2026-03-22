/* ─────────────────────────────────────────────────────────────────────────────
 * Interactive Globe — WebGL rotating earth rendered on <canvas>.
 * Draws a wireframe sphere with dotted latitude/longitude lines,
 * connection arcs, and glowing nodes to represent global volunteer
 * connections. Pure Canvas 2D — no Three.js dependency.
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useRef, useEffect, useCallback } from 'react';

interface GlobeProps {
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

// ── Points of interest (lat, lng) ──────────────────────────────────────────
const LOCATIONS: [number, number][] = [
    [6.5, 3.4],      // Lagos
    [9.06, 7.49],     // Abuja
    [51.5, -0.12],    // London
    [40.7, -74.0],    // New York
    [-1.28, 36.82],   // Nairobi
    [28.6, 77.2],     // Delhi
    [-33.9, 18.4],    // Cape Town
    [35.7, 139.7],    // Tokyo
    [-23.5, -46.6],   // São Paulo
    [55.75, 37.6],    // Moscow
];

// ── Arcs connecting some locations ────────────────────────────────────────
const ARCS: [number, number][] = [
    [0, 2], [0, 4], [1, 3], [2, 5], [3, 8], [4, 6], [5, 7], [6, 9], [7, 3],
];

function latLngToXYZ(lat: number, lng: number, r: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return [
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
    ];
}

function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos + z * sin, y, -x * sin + z * cos];
}

function project(x: number, y: number, z: number, cx: number, cy: number): { px: number; py: number; visible: boolean } {
    return { px: cx + x, py: cy - y, visible: z > 0 };
}

export default function Globe({ size = 400, color = '#10b981', className, style }: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const angleRef = useRef<number>(0);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = size;
        const h = size;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const cx = w / 2;
        const cy = h / 2;
        const R = (Math.min(w, h) / 2) * 0.78;
        const angle = angleRef.current;

        ctx.clearRect(0, 0, w, h);

        // ── Glow behind globe ──────────────────────────────────────────
        const glow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.3);
        glow.addColorStop(0, `${color}10`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // ── Globe outline ─────────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}18`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // ── Longitude lines ───────────────────────────────────────────
        for (let lng = -180; lng < 180; lng += 30) {
            ctx.beginPath();
            for (let lat = -90; lat <= 90; lat += 3) {
                const [x, y, z] = latLngToXYZ(lat, lng, R);
                const [rx, ry, rz] = rotateY(x, y, z, angle);
                const { px, py, visible } = project(rx, ry, rz, cx, cy);
                if (!visible) continue;
                if (lat === -90 || !visible) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `${color}0d`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // ── Latitude lines ────────────────────────────────────────────
        for (let lat = -60; lat <= 60; lat += 30) {
            ctx.beginPath();
            for (let lng = -180; lng <= 180; lng += 3) {
                const [x, y, z] = latLngToXYZ(lat, lng, R);
                const [rx, ry, rz] = rotateY(x, y, z, angle);
                const { px, py, visible } = project(rx, ry, rz, cx, cy);
                if (!visible) continue;
                if (lng === -180 || !visible) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `${color}0d`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // ── Dotted grid points ────────────────────────────────────────
        for (let lat = -80; lat <= 80; lat += 10) {
            for (let lng = -180; lng < 180; lng += 10) {
                const [x, y, z] = latLngToXYZ(lat, lng, R);
                const [rx, ry, rz] = rotateY(x, y, z, angle);
                const { px, py, visible } = project(rx, ry, rz, cx, cy);
                if (!visible) continue;
                const alpha = Math.max(0.02, (rz / R) * 0.08);
                ctx.beginPath();
                ctx.arc(px, py, 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
                ctx.fill();
            }
        }

        // ── Connection arcs ───────────────────────────────────────────
        for (const [from, to] of ARCS) {
            const [lat1, lng1] = LOCATIONS[from];
            const [lat2, lng2] = LOCATIONS[to];

            ctx.beginPath();
            let started = false;
            const steps = 32;
            for (let t = 0; t <= steps; t++) {
                const f = t / steps;
                const lat = lat1 + (lat2 - lat1) * f;
                const lng = lng1 + (lng2 - lng1) * f;
                const altitude = R + Math.sin(f * Math.PI) * R * 0.15;
                const [x, y, z] = latLngToXYZ(lat, lng, altitude);
                const [rx, ry, rz] = rotateY(x, y, z, angle);
                const { px, py, visible } = project(rx, ry, rz, cx, cy);
                if (!visible) { started = false; continue; }
                if (!started) { ctx.moveTo(px, py); started = true; }
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `${color}30`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // ── Location dots ─────────────────────────────────────────────
        for (const [lat, lng] of LOCATIONS) {
            const [x, y, z] = latLngToXYZ(lat, lng, R);
            const [rx, ry, rz] = rotateY(x, y, z, angle);
            const { px, py, visible } = project(rx, ry, rz, cx, cy);
            if (!visible) continue;

            const depth = rz / R;

            // Outer glow
            const grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
            grad.addColorStop(0, `${color}${Math.round(depth * 40).toString(16).padStart(2, '0')}`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `${color}${Math.round(depth * 200 + 55).toString(16).padStart(2, '0')}`;
            ctx.fill();
        }

        angleRef.current += 0.003;
        animRef.current = requestAnimationFrame(draw);
    }, [size, color]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                width: size,
                height: size,
                ...style,
            }}
        />
    );
}
