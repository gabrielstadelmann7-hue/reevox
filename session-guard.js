// ═══════════════════════════════════════════════════════
// SESSION GUARD — Reevox
// Empêche un compte d'être connecté sur 2 appareils
// Ajoute ce script sur toutes les pages protégées :
// <script src="session-guard.js"></script>
// ═══════════════════════════════════════════════════════

(function () {

    const DB_URL    = "https://reevox-gamehub-default-rtdb.europe-west1.firebasedatabase.app";
    const sessionId = localStorage.getItem('reevox_session_id');
    const userKey   = localStorage.getItem('reevox_user_key');

    // Si pas de session → pas besoin de vérifier
    if (!sessionId || !userKey) return;

    async function checkSession() {
        try {
            const res  = await fetch(`${DB_URL}/users/${userKey}/sessionId.json`);
            const serverSession = await res.json();

            if (serverSession && serverSession !== sessionId) {
                // Un autre appareil s'est connecté → déconnexion forcée
                localStorage.clear();
                alert('⚠️ Ton compte Reevox a été connecté sur un autre appareil.\nTu as été déconnecté automatiquement.');
                window.location.href = 'paiement.html';
            }
        } catch (e) {
            // Erreur réseau → on laisse passer silencieusement
        }
    }

    // Vérifier immédiatement + toutes les 10 secondes
    checkSession();
    setInterval(checkSession, 10000);

})();