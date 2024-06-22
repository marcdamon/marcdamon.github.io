let tokenClient;

function handleCredentialResponse(response) {
    console.log("Credential response received:", response);
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse.error) {
                console.error("Error receiving token response:", tokenResponse.error);
                return;
            }
            console.log("Token response received:", tokenResponse);
            localStorage.setItem('gapiToken', tokenResponse.access_token);
            fetchSheetData();
        },
    });
    tokenClient.requestAccessToken({ prompt: '' });
}

function gapiLoaded() {
    console.log("Loading Google API client...");
    gapi.load('client', initializeGapiClient);
}

function initializeGapiClient() {
    console.log("Initializing Google API client...");
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(function () {
        console.log("Google API client initialized.");
        let token = localStorage.getItem('gapiToken');
        if (token) {
            gapi.client.setToken({ access_token: token });
            fetchSheetData();
        } else {
            gisLoaded();
        }
    }, function(error) {
        console.error("Error initializing GAPI client:", error.details);
    });
}

function gisLoaded() {
    console.log("GIS loaded.");
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
    });
    document.getElementById('signin-button').onclick = () => google.accounts.id.prompt();
}

document.getElementById('signout-button').addEventListener('click', function() {
    console.log("Sign out button clicked.");
    localStorage.removeItem('gapiToken');
    google.accounts.id.disableAutoSelect();
    location.reload();
});
