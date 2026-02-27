import { VehicleData } from '../types';

export function generateStandaloneHTML(data: VehicleData) {
    const imagesJSON = JSON.stringify(data.images);
    const whatsappUrl = `https://wa.me/55${(data.whatsapp || '').replace(/\D/g, '')}?text=Olá! Vi o anúncio do ${data.model} ${data.version} e gostaria de mais informações.`;
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.price));
    const kmFormatted = new Intl.NumberFormat('pt-BR').format(Number(data.km)) + ' km';
    const differentialsList = data.differentials.split('\n').filter(d => d.trim());

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.model} ${data.version} - ${data.year} | AutoPage</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            red: '#E31837',
                            dark: '#0A0A0A',
                            gray: '#1F1F1F',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #0A0A0A; color: white; font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Outfit', sans-serif; }
        .glass-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; }
        .btn-primary { background-color: #E31837; color: white; font-weight: bold; padding: 0.75rem 1.5rem; border-radius: 0.75rem; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
        .btn-primary:hover { background-color: #c4152f; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #1F1F1F; border-radius: 10px; border: 2px solid #0A0A0A; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    </style>
</head>
<body class="antialiased">
    <div id="app">
        <!-- Hero -->
        <section class="relative h-[70vh] md:h-[85vh] overflow-hidden">
            <img id="hero-img" src="${data.images[0]}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" alt="${data.model}">
            <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-black/30"></div>
            <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto w-full">
                <div class="space-y-4 animate-fade-in">
                    <div class="flex flex-wrap gap-2">
                        <span class="bg-brand-red text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Destaque</span>
                        <span class="bg-white/10 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">${data.city}</span>
                    </div>
                    <h1 class="text-4xl md:text-7xl font-display font-extrabold tracking-tight leading-none">
                        ${data.model} <br>
                        <span class="text-brand-red">${data.version}</span>
                    </h1>
                    <div class="flex items-center gap-6 text-lg md:text-xl text-white/80 font-medium">
                        <span>📅 ${data.year}</span>
                        <span>🏎️ ${kmFormatted}</span>
                    </div>
                    <div class="text-3xl md:text-5xl font-display font-bold text-white">
                        ${priceFormatted}
                    </div>
                </div>
            </div>
            <!-- Controls -->
            <div class="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 md:px-8 pointer-events-none">
                <button onclick="prevImg()" class="p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white pointer-events-auto transition-all">❮</button>
                <button onclick="nextImg()" class="p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white pointer-events-auto transition-all">❯</button>
            </div>
        </section>

        <!-- Gallery -->
        <section class="max-w-7xl mx-auto px-6 py-16">
            <h2 class="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                <div class="w-2 h-8 bg-brand-red rounded-full"></div>
                Galeria de Fotos
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${data.images.map((img, idx) => `
                <div onclick="openLightbox(${idx})" class="aspect-video rounded-xl overflow-hidden cursor-pointer bg-brand-gray hover:scale-[1.02] transition-transform">
                    <img src="${img}" class="w-full h-full object-cover" alt="View ${idx}">
                </div>`).join('')}
            </div>
        </section>

        <!-- Details -->
        <section class="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
            <div class="space-y-8">
                <h2 class="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                    <div class="w-2 h-8 bg-brand-red rounded-full"></div>
                    Diferenciais
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    ${differentialsList.map(diff => `
                    <div class="flex items-start gap-3 p-4 glass-card">
                        <span class="text-brand-red">✓</span>
                        <span class="text-white/90">${diff}</span>
                    </div>`).join('')}
                </div>
            </div>
            <div class="space-y-8">
                <div class="glass-card p-8 space-y-6">
                    <h3 class="text-xl font-display font-bold">Contato</h3>
                    <div class="space-y-4 text-white/70">
                        <p>📍 Localização: ${data.city}</p>
                        <p>📱 WhatsApp: ${data.whatsapp}</p>
                        ${data.instagram ? `<p class="flex items-center gap-2">📸 Instagram: <a href="https://instagram.com/${data.instagram.replace('@', '')}" target="_blank" class="hover:text-brand-red">${data.instagram}</a></p>` : ''}
                    </div>
                    <a href="${whatsappUrl}" target="_blank" class="btn-primary w-full justify-center py-4 text-lg">
                        Falar com Vendedor
                    </a>
                </div>
            </div>
        </section>

        <!-- Sticky WhatsApp -->
        <a href="${whatsappUrl}" target="_blank" class="fixed bottom-8 right-8 z-50 bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>

        <!-- Lightbox -->
        <div id="lightbox" class="fixed inset-0 z-[100] bg-black/95 hidden items-center justify-center p-4">
            <button onclick="closeLightbox()" class="absolute top-6 right-6 text-white/50 hover:text-white">✕</button>
            <div class="relative w-full max-w-6xl aspect-video">
                <img id="lightbox-img" src="" class="w-full h-full object-contain">
                <button onclick="prevImg()" class="absolute left-0 inset-y-0 p-4 text-white/50 hover:text-white">❮</button>
                <button onclick="nextImg()" class="absolute right-0 inset-y-0 p-4 text-white/50 hover:text-white">❯</button>
            </div>
        </div>
    </div>

    <script>
        const images = ${imagesJSON};
        let currentIdx = 0;

        function updateHero() {
            document.getElementById('hero-img').src = images[currentIdx];
        }

        function nextImg() {
            currentIdx = (currentIdx + 1) % images.length;
            updateHero();
            if(!document.getElementById('lightbox').classList.contains('hidden')) {
                document.getElementById('lightbox-img').src = images[currentIdx];
            }
        }

        function prevImg() {
            currentIdx = (currentIdx - 1 + images.length) % images.length;
            updateHero();
            if(!document.getElementById('lightbox').classList.contains('hidden')) {
                document.getElementById('lightbox-img').src = images[currentIdx];
            }
        }

        function openLightbox(idx) {
            currentIdx = idx;
            document.getElementById('lightbox-img').src = images[currentIdx];
            document.getElementById('lightbox').classList.remove('hidden');
            document.getElementById('lightbox').classList.add('flex');
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.add('hidden');
            document.getElementById('lightbox').classList.remove('flex');
        }

        setInterval(nextImg, 5000);
    </script>
</body>
</html>`;
}
