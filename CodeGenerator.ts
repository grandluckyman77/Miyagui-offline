export interface GeneratedCode {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export class CodeGenerator {
  private templates: Record<string, Record<string, (params: any) => string>> = {
    'python': {
      'scraper': (p) => `import requests
from bs4 import BeautifulSoup
import json

def scrape_${p.target || 'site'}():
    url = "${p.url || 'https://example.com'}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')

        data = []
        # Add your selectors here
        items = soup.find_all('${p.selector || 'div'}')

        for item in items:
            data.append({
                'title': item.get_text(strip=True),
                'link': item.get('href', '')
            })

        with open('output.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return f"Scraped {len(data)} items"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    print(scrape_${p.target || 'site'}())`,

      'encryptor': (p) => `from cryptography.fernet import Fernet
import base64
import os

class SecureVault:
    def __init__(self, key=None):
        self.key = key or Fernet.generate_key()
        self.cipher = Fernet(self.key)

    def encrypt_file(self, filepath):
        with open(filepath, 'rb') as f:
            data = f.read()
        encrypted = self.cipher.encrypt(data)
        with open(filepath + '.encrypted', 'wb') as f:
            f.write(encrypted)
        return filepath + '.encrypted'

    def decrypt_file(self, filepath):
        with open(filepath, 'rb') as f:
            data = f.read()
        decrypted = self.cipher.decrypt(data)
        return decrypted

vault = SecureVault()
print("Vault initialized")`,

      'automation': (p) => `import schedule
import time
from datetime import datetime

def ${p.task || 'task'}():
    print(f"[{datetime.now()}] Executing ${p.task || 'task'}...")
    # Add your logic here
    return True

# Schedule tasks
schedule.every(${p.interval || 10}).minutes.do(${p.task || 'task'})

if __name__ == "__main__":
    print("Scheduler started...")
    while True:
        schedule.run_pending()
        time.sleep(1)`
    },

    'javascript': {
      'api': (p) => `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/${p.endpoint || 'data'}', async (req, res) => {
    try {
        // Add your logic
        res.json({ 
            status: 'success', 
            data: [],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});`,

      'scraper': (p) => `const puppeteer = require('puppeteer');

async function scrape${p.target ? p.target.charAt(0).toUpperCase() + p.target.slice(1) : 'Site'}() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto('${p.url || 'https://example.com'}', { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        // Add your selectors
        return document.querySelectorAll('${p.selector || 'h1'}').map(el => el.textContent);
    });

    await browser.close();
    return data;
}

scrape${p.target ? p.target.charAt(0).toUpperCase() + p.target.slice(1) : 'Site'}().then(console.log);`,

      'crypto': (p) => `const crypto = require('crypto');

class LocalEncryptor {
    constructor(password) {
        this.password = password;
    }

    encrypt(text) {
        const salt = crypto.randomBytes(16);
        const key = crypto.scryptSync(this.password, salt, 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();
        return salt.toString('hex') + ':' + iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    }

    decrypt(encryptedData) {
        const [salt, iv, authTag, encrypted] = encryptedData.split(':');
        const key = crypto.scryptSync(this.password, Buffer.from(salt, 'hex'), 32);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

module.exports = LocalEncryptor;`
    },

    'bash': {
      'recon': (p) => `#!/bin/bash
# Network Recon Script
TARGET="${p.target || '192.168.1.1'}"
OUTPUT="recon_$(date +%Y%m%d_%H%M%S).txt"

echo "[*] Starting recon on $TARGET" | tee $OUTPUT

# Host discovery
echo "[*] Host discovery..." | tee -a $OUTPUT
ping -c 1 $TARGET | tee -a $OUTPUT

# Port scan (common ports)
echo "[*] Port scanning..." | tee -a $OUTPUT
for port in 22 80 443 445 3306 3389 8080; do
    timeout 1 bash -c "echo >/dev/tcp/$TARGET/$port" 2>/dev/null && \
        echo "[+] Port $port open" | tee -a $OUTPUT
done

# DNS enumeration
echo "[*] DNS info..." | tee -a $OUTPUT
host $TARGET | tee -a $OUTPUT 2>/dev/null || echo "[-] DNS lookup failed"

echo "[*] Recon complete. Saved to $OUTPUT"`,

      'backup': (p) => `#!/bin/bash
# Automated Backup Script
SOURCE="${p.source || '/home/user/data'}"
DEST="${p.dest || '/backup'}"
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE="backup_$DATE.tar.gz"

echo "[*] Starting backup of $SOURCE"

# Create backup directory
mkdir -p $DEST

# Compress and archive
tar -czf "$DEST/$ARCHIVE" -C "$(dirname $SOURCE)" "$(basename $SOURCE)"

# Verify
if [ -f "$DEST/$ARCHIVE" ]; then
    echo "[+] Backup successful: $DEST/$ARCHIVE"
    echo "[*] Size: $(du -h $DEST/$ARCHIVE | cut -f1)"
else
    echo "[-] Backup failed"
fi`,

      'security': (p) => `#!/bin/bash
# Security Audit Script

echo "[*] System Security Audit"
echo "=========================="

# Check for updates
echo "[*] Checking for security updates..."
apt list --upgradable 2>/dev/null | grep -i security || echo "[-] No security updates available"

# Check firewall
echo "[*] Firewall status..."
ufw status | head -5 || iptables -L | head -10

# Check SSH config
echo "[*] SSH configuration..."
grep -E "PermitRootLogin|PasswordAuthentication|Port" /etc/ssh/sshd_config 2>/dev/null || echo "[-] SSH config not found"

# Check for suspicious processes
echo "[*] Running processes..."
ps aux | grep -E "nc|netcat|nmap|metasploit" | grep -v grep || echo "[+] No suspicious processes"

# Check file permissions
echo "[*] SUID files..."
find / -perm -4000 -type f 2>/dev/null | head -10

echo "[*] Audit complete"`
    },

    'sql': {
      'analysis': (p) => `-- Data Analysis Query
SELECT 
    ${p.columns || '*'},
    COUNT(*) as total_records,
    AVG(${p.metric || 'value'}) as avg_metric,
    MAX(${p.metric || 'value'}) as max_metric,
    MIN(${p.metric || 'value'}) as min_metric
FROM ${p.table || 'data_table'}
WHERE created_at >= DATE('now', '-30 days')
GROUP BY ${p.groupBy || 'category'}
HAVING total_records > 5
ORDER BY avg_metric DESC
LIMIT 100;`,

      'security': (p) => `-- Security Audit Query
-- Check for weak passwords
SELECT username, 
       LENGTH(password_hash) as hash_length,
       last_login,
       failed_attempts
FROM users
WHERE password_hash IS NULL 
   OR LENGTH(password_hash) < 32
   OR failed_attempts > 5;

-- Check for privilege escalation
SELECT u.username, r.role_name, p.permission
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.permission LIKE '%admin%'
   OR p.permission LIKE '%delete%';`
    }
  };

  generate(language: string, template: string, params: any = {}): GeneratedCode {
    const langTemplates = this.templates[language];
    if (!langTemplates) {
      throw new Error(`Language ${language} not supported`);
    }

    const generator = langTemplates[template];
    if (!generator) {
      throw new Error(`Template ${template} not found for ${language}`);
    }

    const code = generator(params);

    return {
      id: `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${language.toUpperCase()} - ${template}`,
      language,
      code,
      description: `Auto-generated ${template} in ${language}`,
      tags: [language, template, 'auto-generated'],
      createdAt: new Date().toISOString()
    };
  }

  getAvailableLanguages(): string[] {
    return Object.keys(this.templates);
  }

  getAvailableTemplates(language: string): string[] {
    return Object.keys(this.templates[language] || {});
  }

  analyzeCode(code: string, language: string): {
    complexity: number;
    lines: number;
    functions: number;
    warnings: string[];
    suggestions: string[];
  } {
    const lines = code.split('
').filter(l => l.trim());
    const functions = (code.match(/function|def |const .* = .*=>|async |class /g) || []).length;

    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (code.includes('password') || code.includes('secret')) {
      warnings.push('Hardcoded credentials detected');
      suggestions.push('Use environment variables for secrets');
    }

    if (code.includes('eval(') || code.includes('exec(')) {
      warnings.push('Dangerous function usage detected');
      suggestions.push('Avoid eval/exec, use safer alternatives');
    }

    if (lines.length > 200) {
      suggestions.push('Consider splitting into smaller modules');
    }

    return {
      complexity: Math.min(100, lines.length / 2 + functions * 5),
      lines: lines.length,
      functions,
      warnings,
      suggestions
    };
  }
}
