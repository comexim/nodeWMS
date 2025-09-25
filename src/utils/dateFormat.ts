export function formatDate(date: string, format: "dma" | "amd"): string {
    let d: Date;
    if (date.includes("/")) {
        const [day, month, year] = date.split("/");
        d = new Date(Number(year), Number(month) - 1, Number(day));
    } else if (date.includes("-")) {
        d = new Date(date);
    } else if (/^\d{8}$/.test(date)){
        const year = Number(date.slice(0,4));
        const month = Number(date.slice(4,6));
        const day = Number(date.slice(6,8));
        d = new Date(year, month - 1, day);
    } else {
        d= new Date(date)
    }

    const pad = (n: number) => n.toString().padStart(2, "0");

    if (format === "dma") {
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    } else if (format === "amd") {
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    } else {
        throw new Error("Formato inválido");
    }
}