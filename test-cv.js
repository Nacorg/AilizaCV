const { analyzeCVLocally } = require('./server.js');

const sampleCV = `Licenciatura en Marketing
Diplomado en Publicidad
UNIVERSIDAD ALTA PINTA
2010-2014
UNIVERSIDAD ALTA PINTA
2014-2016  EDUCACIÓN: Formación de Servicio
de comidas en centros
sanitarios y
sociosanitarios
Planificador de Menús y
Dietas Especiales
Monitor comedor
escolar.`;

const result = analyzeCVLocally(sampleCV);
console.log('Education:', JSON.stringify(result.education, null, 2));
console.log('Experience:', JSON.stringify(result.experience, null, 2));
