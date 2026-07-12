// Fichier : src/lib/seo_utils.ts

export const calculateLiveSEO = (text: string, title: string) => {
    if (!text) return { total_score: 0, grade: "None", details: [] };

    // Nettoyage sécurisé
    const focusKW = title ? title.split('-')[0].toLowerCase().trim() : "property";
    const cleanText = text.toLowerCase().replace(/\*\*/g, "");
    
    let score = 0;
    const details = [];

    // 1. Content Depth (40 pts) - Objectif 1500
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    let depthStatus = "poor";
    if (words >= 1500) { score += 40; depthStatus = "excellent"; }
    else if (words >= 1200) { score += 30; depthStatus = "good"; }
    else { score += 15; }
    details.push({ label: "Content Depth", status: depthStatus, desc: `${words} / 1500 words` });

    // 2. Keyword in Title (20 pts)
    const lines = text.split('\n');
    const h1Line = lines.find(l => l.startsWith('#')) || "";
    const hasKWTitle = h1Line.toLowerCase().includes(focusKW);
    if (hasKWTitle) score += 20;
    details.push({ label: "Keyword in Title", status: hasKWTitle ? "excellent" : "poor", desc: hasKWTitle ? "H1 Optimized" : "Check Title" });

    // 3. Heading Flow (20 pts)
    const headers = (text.match(/^#{2,3}\s/gm) || []).length;
    const headStatus = headers >= 6 ? "excellent" : "poor";
    if (headers >= 6) score += 20; else score += 10;
    details.push({ label: "Heading Flow", status: headStatus, desc: `${headers} headers found` });

    // 4. Intro focus (20 pts)
    const intro = cleanText.slice(0, 600);
    const hasKWIntro = intro.includes(focusKW);
    if (hasKWIntro) score += 20;
    details.push({ label: "Intro Focus", status: hasKWIntro ? "excellent" : "poor", desc: hasKWIntro ? "Verified" : "Missing" });

    return {
        total_score: score,
        grade: score >= 85 ? "Premium" : score >= 60 ? "Institutional" : "Draft",
        details: details
    };
};