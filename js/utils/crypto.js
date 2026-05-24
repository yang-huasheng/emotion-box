const Crypto = {
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);

        if (!window.crypto || !window.crypto.subtle) {
            return this.simpleHash(password);
        }

        try {
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Hash error:', error);
            return this.simpleHash(password);
        }
    },

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    },

    async verifyPassword(inputPassword, storedHash) {
        const inputHash = await this.hashPassword(inputPassword);
        return inputHash === storedHash;
    },

    async encrypt(text, password) {
        if (!password) return btoa(unescape(encodeURIComponent(text)));

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            if (!window.crypto || !window.crypto.subtle) {
                return this.simpleEncrypt(text, password);
            }

            const key = await this.deriveKey(password);
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            return btoa(String.fromCharCode.apply(null, combined));
        } catch (error) {
            console.error('Encrypt error:', error);
            return this.simpleEncrypt(text, password);
        }
    },

    async decrypt(encryptedData, password) {
        if (!password) {
            try {
                return decodeURIComponent(escape(atob(encryptedData)));
            } catch {
                return null;
            }
        }

        try {
            const combined = new Uint8Array(
                atob(encryptedData).split('').map(c => c.charCodeAt(0))
            );

            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const key = await this.deriveKey(password);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decrypt error:', error);
            return null;
        }
    },

    async deriveKey(password) {
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);

        const hash = await crypto.subtle.digest('SHA-256', passwordData);
        const keyData = new Uint8Array(hash);

        return crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    },

    simpleEncrypt(text, password) {
        const encrypted = [];
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
            encrypted.push(charCode);
        }
        return btoa(String.fromCharCode.apply(null, encrypted));
    },

    simpleDecrypt(encryptedText, password) {
        try {
            const encrypted = atob(encryptedText).split('').map(c => c.charCodeAt(0));
            const decrypted = [];
            for (let i = 0; i < encrypted.length; i++) {
                const charCode = encrypted[i] ^ password.charCodeAt(i % password.length);
                decrypted.push(charCode);
            }
            return String.fromCharCode.apply(null, decrypted);
        } catch {
            return null;
        }
    },

    lockState: {
        failedAttempts: 0,
        lockedUntil: null,

        isLocked() {
            if (this.lockedUntil && Date.now() < this.lockedUntil) {
                return true;
            }
            this.lockedUntil = null;
            return false;
        },

        recordFailedAttempt() {
            this.failedAttempts++;
            if (this.failedAttempts >= 3) {
                this.lockedUntil = Date.now() + 5 * 60 * 1000;
                this.failedAttempts = 0;
            }
        },

        reset() {
            this.failedAttempts = 0;
            this.lockedUntil = null;
        },

        getRemainingLockTime() {
            if (!this.lockedUntil) return 0;
            return Math.max(0, Math.ceil((this.lockedUntil - Date.now()) / 1000));
        }
    }
};
