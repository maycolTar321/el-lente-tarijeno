export const slugify=(s:string)=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);
export const dateFmt=(s:string|null)=>s?new Intl.DateTimeFormat("es-BO",{day:"numeric",month:"long",year:"numeric"}).format(new Date(s)):"Fecha por confirmar";
