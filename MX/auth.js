import { CLIENT_ID, SCOPES } from './config.js';

export function initializeAuth(callback) {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
    });
    document.getElementById('signin-button').onclick = () => google.accounts.id.prompt();

    function handleCredentialResponse(response) {
        console.log("Credential response received:", response);
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    console.error("Error receiving token response:", tokenResponse.error);
                    return;
                }
                console.log("Token response received:", tokenResponse);
                localStorage.setItem('gapiToken', tokenResponse.access_token);
                callback();
            },
        });
        tokenClient.requestAccessToken({ prompt: '' });
    }
}
