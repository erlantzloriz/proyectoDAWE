// Función para hashear el nombre y generar ID único (Requisito 4.1.1)
export function generarId(nombre) {
    let hash = 0;
    if (nombre.length === 0) return hash;
    for (let i = 0; i < nombre.length; i++) {
        const char = nombre.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a 32bit integer
    }
    return "id_" + Math.abs(hash);
}