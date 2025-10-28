const http = require('http');

async function checkSubgraphStatus() {
    console.log("🔍 Subgraph Status Kontrol Ediliyor...\n");
    
    const data = JSON.stringify({
        query: `{
            indexingStatusForCurrentVersion(subgraphName: "yemeksepeti-subgraph") {
                synced
                health
                fatalError {
                    message
                }
            }
        }`
    });
    
    const options = {
        hostname: 'localhost',
        port: 8020,
        path: '/graphql',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`📊 HTTP Status: ${res.statusCode}`);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(responseData);
                console.log("✅ Subgraph Status:");
                console.log(JSON.stringify(result, null, 2));
                
                // Basit test query'si dene
                if (result.error) {
                    console.log("\n🔄 Basit test query'si deneniyor...");
                    testSimpleQuery();
                }
            } catch (error) {
                console.log("❌ JSON Parse Hatası:", error.message);
                console.log("📄 Raw Response:", responseData);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error("❌ Request Hatası:", error.message);
    });
    
    req.write(data);
    req.end();
}

function testSimpleQuery() {
    const simpleData = JSON.stringify({
        query: `{
            _meta {
                hasIndexingErrors
                block {
                    number
                }
            }
        }`
    });
    
    const options = {
        hostname: 'localhost',
        port: 8020,
        path: '/graphql',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': simpleData.length
        }
    };
    
    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(responseData);
                console.log("✅ Basit Query Sonucu:");
                console.log(JSON.stringify(result, null, 2));
            } catch (error) {
                console.log("❌ Basit Query Hatası:", error.message);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error("❌ Basit Query Request Hatası:", error.message);
    });
    
    req.write(simpleData);
    req.end();
}

checkSubgraphStatus();
