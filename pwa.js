// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`'beforeinstallprompt' event was fired.`);
});

const INSTALL_UI = `
    <div class="installContainer pabs t0 w100 h100">
    <div class="pfx b0 w100">
    <div class="card w100 p12">
    <div class="fl fl-c w100 fl-d-cl" style="padding: 1rem 0">
    <h1 style="padding-bottom: 1rem">Install Group</h1>
    <button role="button" class="s-btn p12 cp">Install</button>
    </div>
    </div>
    </div>
    </div>
    `;

const showInstallPromotion = () => {
    const installCont = document.createElement('div');
    installCont.classList.add('pfx', 't0', 'w100', 'h100');
    installCont.innerHTML = '';
    installCont.innerHTML = INSTALL_UI;
    document.getElementById('app').appendChild(installCont);

    installCont.children[0].addEventListener('click', e => {
        if (e.target == e.currentTarget)
            hideInstallPromotion();
    })

    installCont.querySelector('button[role=button]').addEventListener('click', async e => {
        e.currentTarget.textContent = 'Installing...';
        installCont.querySelector('h1').textContent = 'Installing Group';

        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // Optionally, send analytics event with outcome of user choice
        // console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        // hide prompt
        hideInstallPromotion();
    })
    
    const hideInstallPromotion = () => {
        installCont.remove();
    };
}