// Header ve footer'ı yükle
async function loadComponents() {
    try {
        const headerResponse = await fetch('components/header.html');
        const footerResponse = await fetch('components/footer.html');
        
        if (headerResponse.ok) {
            const headerHtml = await headerResponse.text();
            document.getElementById('header').innerHTML = headerHtml;
            // Header yüklendikten sonra menüyü güncelle
            updateMenu();
        }
        
        if (footerResponse.ok) {
            const footerHtml = await footerResponse.text();
            document.getElementById('footer').innerHTML = footerHtml;
        }
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Sayfa yüklendiğinde bileşenleri yükle
document.addEventListener('DOMContentLoaded', loadComponents); 