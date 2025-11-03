export class AvatarGenerator {
    /**
     * @param name El nombre de la persona.
     * @param surname El apellido de la persona.
     * @returns Un string con la URL de la imagen generada en formato base64.
     */
    static generateAvatar(name: string, surname: string): string {
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No se pudo obtener el contexto del canvas.');
        }

        // Colores predefinidos
        const colors = ['#063452', '#063452', '#063452'];
        const colorIndex = AvatarGenerator.hashCode(name + surname) % colors.length;
        const consistentColor = colors[Math.abs(colorIndex)];

        ctx.fillStyle = consistentColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Iniciales
        const initials = `${name.charAt(0).toUpperCase()}${surname.charAt(0).toUpperCase()}`;
        ctx.font = '600 28px "Poppins", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL('image/png');
    }

    /**
     * Genera un hash numérico a partir de una cadena de texto.
     * @param str La cadena de texto.
     * @returns Un número hash.
     */
    private static hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }
}
