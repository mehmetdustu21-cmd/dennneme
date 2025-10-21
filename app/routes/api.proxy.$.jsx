export async function loader({ request }) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  console.log('🔵 Proxy Request:', pathname);
  
  // /api/proxy/models/male-1.png -> models/male-1.png
  const filePath = pathname.replace('/api/proxy/', '');
  
  console.log('📁 Requested:', filePath);
  
  if (filePath.startsWith('models/')) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const fileName = filePath.replace('models/', '');
      const imagePath = path.join(process.cwd(), 'public', 'models', fileName);
      
      console.log('🖼️ Looking for:', imagePath);
      
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const ext = path.extname(fileName).toLowerCase();
        
        const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
        
        console.log('✅ Image found!');
        
        return new Response(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000'
          }
        });
      } else {
        console.log('❌ File not found');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  return new Response('Not Found', { status: 404 });
}