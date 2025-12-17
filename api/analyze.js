// api/analyze.js
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { cvText } = req.body;

        if (!cvText) {
            return res.status(400).json({ error: 'CV text is required' });
        }

        // Análisis inteligente local (100% gratuito)
        const result = analyzeCVLocally(cvText);
        return res.status(200).json(result);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Error analyzing CV',
            details: error.message
        });
    }
}

// Función de análisis inteligente sin APIs externas (100% gratuita)
function analyzeCVLocally(cvText) {
    const text = cvText.toLowerCase();

    // Análisis básico del contenido
    const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(cvText);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/.test(cvText);
    const hasExperience = /(experiencia|trabajo|laboral|puesto|cargo|experience|work|job|position)/.test(text);
    const hasEducation = /(educación|estudios|universidad|carrera|grado|título|education|university|degree|studies)/.test(text);
    const hasSkills = /(habilidades|competencias|conocimientos|skills|abilities|competencies)/.test(text);

    // Detectar sector basado en palabras clave con mejor precisión
    let sector = "General";
    let role = "Profesional";
    let skills = [];
    let color = "from-blue-500 to-cyan-500";

    // Keywords mejoradas por sector
    const techKeywords = /\b(desarrollador|programador|ingeniero|software|it|tecnología|javascript|python|java|c\+\+|php|html|css|react|angular|vue|node|backend|frontend|fullstack|devops|docker|kubernetes|aws|azure|git|github|sql|mysql|mongodb|api|rest|desarrollo|programación|código|algoritmo|base de datos|servidor|cloud|computación|informática|algoritmos|estructuras de datos|patrones de diseño|arquitectura|microservicios|testing|automatización|ci\/cd|integración continua|despliegue continuo|developer|programmer|engineer|coding|code|programming)\b/gi;
    
    const marketingKeywords = /\b(marketing|mercadeo|ventas|comercial|cliente|publicidad|anuncio|campaña|redes sociales|facebook|instagram|twitter|linkedin|seo|sem|google ads|email marketing|content marketing|brand|branding|social media|influencer|analytics|conversion|comunicación|promoción|estrategia|mercado|digital|estrategia digital|posicionamiento|posicionamiento web|ads|anuncios|publicitarios|comunicación|promocional|cliente|consumidor|target|targeting|engagement|engagement rate|leads|generación de leads|roi|retorno de inversión|kpis|métricas|performance|desempeño|canales|multicanal|omnicanal|crm|customer relationship|relaciones públicas|pr|storytelling|contenido|content creator|creador de contenido|influencer marketing|marketing de influencers|growth hacking|crecimiento|acquisition|adquisición|retention|retención|loyalty|fidelización|customer experience|experiencia del cliente|ux|user experience|journey|customer journey|embudo|embudo de conversión|funnel|marketing automation|automatización|email|newsletter|boletín|landing page|página de aterrizaje|call to action|cta|ab testing|pruebas a\/b|segmentación|segmentation|personalización|personalization|remarketing|retargeting|display|search|busqueda|viral|marketing viral|guerrilla|experiential|eventos|event marketing|trade marketing|btl|atl|ttl|sales|advertising|campaign|promotion)\b/gi;
    
    const designKeywords = /\b(diseño|creativo|gráfico|ux|ui|adobe|photoshop|illustrator|indesign|figma|sketch|corel|diseñador|creatividad|branding|logo|identidad visual|prototipo|wireframe|mockup|arte|gráfica|visual|creación|design|designer|creative|graphic|illustration|prototype|artwork|visual identity)\b/gi;
    
    const financeKeywords = /\b(finanzas|contabilidad|auditoría|banca|contable|auditor|financiero|presupuesto|balance|impuestos|facturación|sap|oracle|excel|power bi|erp|crm financiero|riesgo financiero|inversión|banco|crédito|economía|contador|tesorería|finance|accounting|audit|banking|accountant|auditor|budget|taxes|investment|bank|credit|economy|treasury)\b/gi;
    
    const healthKeywords = /\b(salud|médico|enfermero|hospital|clínica|paciente|diagnóstico|tratamiento|medicina|enfermería|doctor|especialista|hospitalario|farmacia|laboratorio|radiología|cirugía|emergencias|salud pública|sanidad|clínico|health|medical|nurse|hospital|clinic|patient|diagnosis|treatment|doctor|pharmacy|surgery|emergency)\b/gi;
    
    const educationKeywords = /\b(profesor|docente|educador|enseñanza|pedagogía|didáctica|colegio|escuela|universidad|instituto|academia|formación|aprendizaje|estudiante|alumno|clase|lección|currículo|programa educativo|teacher|educator|teaching|pedagogy|school|training|learning|student|classroom|curriculum)\b/gi;
    
    const culinaryKeywords = /\b(cocinero|cocina|chef|gastronomía|restaurante|comida|plato|receta|menú|culinaria|gastronómico|alimentación|nutrición|hostelería|hotel|bar|cafetería|comedor|cook|cooking|culinary|restaurant|food|recipe|menu|hospitality|catering)\b/gi;
    
    const constructionKeywords = /\b(obrero|construcción|edificación|obra|albañil|electricista|fontanero|carpintero|madera|metal|soldadura|instalación|reforma|edificio|vivienda|infraestructura|construir|worker|construction|building|electrician|plumber|carpenter|wood|metal|welding|installation)\b/gi;

    const techCount = (text.match(techKeywords) || []).length;
    const marketingCount = (text.match(marketingKeywords) || []).length;
    const designCount = (text.match(designKeywords) || []).length;
    const financeCount = (text.match(financeKeywords) || []).length;
    const healthCount = (text.match(healthKeywords) || []).length;
    const educationCount = (text.match(educationKeywords) || []).length;
    const culinaryCount = (text.match(culinaryKeywords) || []).length;
    const constructionCount = (text.match(constructionKeywords) || []).length;

    // Ponderación: multiplica por factor si hay keywords clave
    let marketingWeighted = marketingCount;
    if (/\bmarketing\b|\bventas\b|\bcomercial\b|\bsales\b/.test(text)) marketingWeighted *= 1.5;

    // Array de sectores con sus conteos para ordenar correctamente
    const sectors = [
        { count: techCount, sector: "Tecnología", role: "Desarrollador/Profesional IT", skills: ["JavaScript", "Python", "SQL", "Git", "React"], color: "from-green-500 to-emerald-500" },
        { count: marketingWeighted, sector: "Marketing y Ventas", role: "Profesional de Marketing/Ventas", skills: ["Marketing Digital", "SEO/SEM", "Redes Sociales", "CRM", "Análisis de Datos"], color: "from-purple-500 to-pink-500" },
        { count: designCount, sector: "Diseño y Creatividad", role: "Diseñador/Profesional Creativo", skills: ["Adobe Creative Suite", "Figma", "UX/UI", "Ilustración", "Branding"], color: "from-orange-500 to-red-500" },
        { count: financeCount, sector: "Finanzas", role: "Profesional Financiero", skills: ["Excel", "SAP", "Análisis Financiero", "Contabilidad", "Auditoría"], color: "from-blue-500 to-indigo-500" },
        { count: healthCount, sector: "Salud", role: "Profesional de la Salud", skills: ["Atención al Paciente", "Diagnóstico", "Tratamientos", "Registro Médico", "Protocolos"], color: "from-red-500 to-pink-500" },
        { count: educationCount, sector: "Educación", role: "Profesor/Educador", skills: ["Pedagogía", "Didáctica", "Evaluación", "Planificación", "Comunicación"], color: "from-yellow-500 to-orange-500" },
        { count: culinaryCount, sector: "Hostelería y Gastronomía", role: "Cocinero/Chef", skills: ["Cocina", "Gastronomía", "Higiene Alimentaria", "Creatividad Culinaria", "Gestión de Menús"], color: "from-red-500 to-orange-500" },
        { count: constructionCount, sector: "Construcción", role: "Profesional de Construcción", skills: ["Construcción", "Instalaciones", "Seguridad Laboral", "Planificación", "Materiales"], color: "from-gray-500 to-slate-500" }
    ];

    // Ordenar por conteo descendente y seleccionar el que tenga más coincidencias
    sectors.sort((a, b) => b.count - a.count);

    // Umbral: Solo selecciona si count >= 2; si no, "General"
    if (sectors[0].count >= 2) {
        sector = sectors[0].sector;
        role = sectors[0].role;
        skills = sectors[0].skills;
        color = sectors[0].color;
    } else {
        skills = ["Comunicación", "Trabajo en equipo", "Adaptabilidad"];
    }

    // Calcular puntuaciones basadas en completitud del CV
    const completenessScore = [hasEmail, hasPhone, hasExperience, hasEducation, hasSkills].filter(Boolean).length;
    const overallScore = Math.min(95, 60 + (completenessScore * 7));

    // Extraer información básica
    const emailMatch = cvText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const phoneMatch = cvText.match(/(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);

    // Extraer educación detallada
    let educationDetails = [];
    if (hasEducation) {
        const lines = cvText.split('\n');
        let currentSection = null;
        let pendingDegrees = [];
        let currentInstitution = "";
        let currentPeriod = "";

        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            if (trimmedLine.length < 3) continue;

            // Detectar secciones
            if (/(?:educación|estudios|formación académica|education|academic|experiencia|experience|trabajo|work|habilidades|skills|competencias|idiomas|languages)/i.test(trimmedLine) && trimmedLine.length < 50) {
                // Procesar grados pendientes
                for (const degree of pendingDegrees) {
                    if (degree.length > 2 && currentInstitution.length > 2) {
                        educationDetails.push({
                            degree: degree,
                            institution: currentInstitution,
                            period: currentPeriod || "Período académico",
                            status: "Completado"
                        });
                    }
                }
                pendingDegrees = [];
                currentSection = trimmedLine.toLowerCase();
                if (!(currentSection.includes('educación') || currentSection.includes('estudios') || currentSection.includes('formación') || currentSection.includes('education') || currentSection.includes('academic'))) {
                    break;
                }
                continue;
            }

            if (currentSection && (currentSection.includes('educación') || currentSection.includes('estudios') || currentSection.includes('formación') || currentSection.includes('education') || currentSection.includes('academic'))) {
                const degreeKeywords = /(?:licenciatur[ae]|ingenier[íi]a?|máster|master|doctorado|phd|doctorate|bachillerato|high school|diplomado|diploma|fp|formación profesional|técnico superior|ciclo formativo|grado superior|grado medio|certificado|certificate|formación|degree|bachelor|education)/i;
                if (degreeKeywords.test(trimmedLine)) {
                    let degree = trimmedLine;
                    let institution = "Institución educativa";
                    let period = "Período académico";
                    
                    for (let k = i + 1; k < lines.length && k < i + 5; k++) {
                        const nextLine = lines[k].trim();
                        if (nextLine.length < 3) continue;
                        if (/(?:^universidad|^instituto|^colegio|^escuela|^centro|^academia|^facultad|^university|^institute|^school|^college)/i.test(nextLine)) {
                            institution = nextLine;
                        } else if (/\d{4}(?:\s*[-–]\s*\d{4})?/.test(nextLine)) {
                            period = nextLine;
                            break;
                        }
                    }
                    educationDetails.push({
                        degree: degree,
                        institution: institution,
                        period: period,
                        status: "Completado"
                    });
                    continue;
                }
            } else if (!currentSection) {
                const degreeKeywords = /(?:licenciatur[ae]|ingenier[íi]a?|máster|master|doctorado|phd|bachillerato|diplomado|fp|formación profesional|técnico superior|ciclo formativo|grado superior|grado medio|certificado|degree|bachelor)/i;
                if (degreeKeywords.test(trimmedLine)) {
                    pendingDegrees.push(trimmedLine);
                } else if (/(?:^universidad|^instituto|^colegio|^escuela|^centro|^academia|^facultad|^university|^institute|^school|^college)/i.test(trimmedLine)) {
                    currentInstitution = trimmedLine;
                } else if (/\d{4}(?:\s*[-–]\s*\d{4})?/.test(trimmedLine)) {
                    currentPeriod = trimmedLine;
                    for (const degree of pendingDegrees) {
                        if (degree.length > 2 && currentInstitution.length > 2) {
                            educationDetails.push({
                                degree: degree,
                                institution: currentInstitution,
                                period: currentPeriod,
                                status: "Completado"
                            });
                        }
                    }
                    pendingDegrees = [];
                }
            }
        }

        for (const degree of pendingDegrees) {
            if (degree.length > 2 && currentInstitution.length > 2) {
                educationDetails.push({
                    degree: degree,
                    institution: currentInstitution,
                    period: currentPeriod || "Período académico",
                    status: "Completado"
                });
            }
        }

        educationDetails = educationDetails.filter((item, index, self) =>
            index === self.findIndex(t => t.degree === item.degree && t.institution === item.institution && t.period === item.period)
        );

        if (educationDetails.length === 0) {
            educationDetails.push({
                degree: "Título identificado en el CV",
                institution: "Institución educativa",
                period: "Período académico",
                status: "Completado"
            });
        }
    }

    // Extraer experiencia detallada
    let experienceDetails = [];
    if (hasExperience) {
        const lines = cvText.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.length < 10) continue;

            const experienceMatch = trimmedLine.match(/(?:trabaj[óe]|labor[óe]|worked)\s+(?:como\s+|as\s+)?([^,]+?)\s+(?:en|de|at|in)\s+([^,]+?),\s*([^,\n\r]*)/i);
            if (experienceMatch) {
                const title = experienceMatch[1].trim();
                const company = experienceMatch[2].trim();
                const period = experienceMatch[3].trim();
                if (title.length > 3 && company.length > 2) {
                    experienceDetails.push({
                        title: title,
                        company: company,
                        period: period,
                        description: "Experiencia profesional detectada en el CV"
                    });
                }
                continue;
            }

            const simpleMatch = trimmedLine.match(/(?:puesto|cargo|posición|rol|position|role|job)\s+(?:de\s+|as\s+)?([^,\n\r]{5,}?)(?:\s+(?:en|de|at|in)\s+([^,\n\r]{3,}?))?(?:\s*,\s*([^,\n\r]*))?/i);
            if (simpleMatch) {
                const title = simpleMatch[1].trim();
                const company = simpleMatch[2] || "Empresa";
                const period = simpleMatch[3] || "Experiencia laboral identificada";
                if (title.length > 3) {
                    experienceDetails.push({
                        title: title,
                        company: company.trim(),
                        period: period.trim(),
                        description: "Experiencia profesional detectada en el CV"
                    });
                }
            }
        }

        if (experienceDetails.length === 0) {
            experienceDetails.push({
                title: "Profesional",
                company: "Empresa",
                period: "Experiencia laboral identificada",
                description: "Experiencia profesional detectada en el CV"
            });
        }
    }

    return {
        name: "Candidato Analizado",
        role: role,
        sector: sector,
        location: "Información no especificada",
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0] : null,
        linkedin: null,
        github: null,
        tagline: `Perfil profesional en ${sector} - Analizado con IA gratuita`,
        overallScore: overallScore,
        education: educationDetails,
        skills: {
            "habilidades_principales": {
                name: `Habilidades en ${sector}`,
                level: Math.floor(overallScore * 0.8),
                techs: skills,
                color: color
            }
        },
        experience: experienceDetails,
        projects: [],
        certifications: [],
        softSkills: [
            { name: "Comunicación", level: Math.floor(Math.random() * 20) + 70 },
            { name: "Trabajo en equipo", level: Math.floor(Math.random() * 20) + 70 },
            { name: "Adaptabilidad", level: Math.floor(Math.random() * 20) + 70 },
            { name: "Resolución de problemas", level: Math.floor(Math.random() * 20) + 70 }
        ],
        languages: [
            { name: "Español", level: "Nativo", percentage: 100 }
        ],
        aiAnalysis: {
            technicalFit: Math.floor(overallScore * 0.9),
            experienceLevel: Math.floor(overallScore * 0.85),
            learningAgility: Math.floor(Math.random() * 20) + 75,
            versatility: Math.floor(Math.random() * 20) + 70,
            keyInsights: [
                `Perfil identificado en el sector ${sector}`,
                hasExperience ? "Experiencia laboral detectada" : "Sin experiencia específica mencionada",
                hasEducation ? "Formación académica identificada" : "Formación académica no especificada",
                hasSkills ? "Habilidades técnicas mencionadas" : "Habilidades no detalladas",
                "CV analizado exitosamente con IA gratuita"
            ],
            strengths: [
                `Conocimientos en ${sector}`,
                hasExperience ? "Experiencia profesional" : "Potencial de aprendizaje",
                "Capacidad de comunicación",
                "Trabajo en equipo"
            ],
            recommendation: `Candidato ${overallScore > 80 ? 'muy recomendado' : overallScore > 70 ? 'recomendado' : 'con potencial'} para posiciones en ${sector}. ${hasExperience ? 'Cuenta con experiencia relevante.' : 'Tiene potencial de crecimiento en el área.'}`,
            idealRoles: [
                role,
                `Especialista en ${sector}`,
                "Profesional General",
                "Consultor"
            ]
        }
    };
}

export { analyzeCVLocally };
