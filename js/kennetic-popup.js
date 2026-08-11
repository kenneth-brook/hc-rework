let popupContainer = null; // Initialize outside the function to maintain reference

const createResponsivePopup = (url) => {
    // Check if the popup already exists and is visible
    if (popupContainer && popupContainer.style.display !== 'none') {
        popupContainer.style.display = 'none'; // Hide the popup
        return; // Stop further execution
    }

    // If the popup doesn't exist, create it
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        Object.assign(popupContainer.style, {
            position: 'fixed',
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '10px solid #fff',
            backgroundColor: '#fff',
            zIndex: '1000',
            display: 'none',
            maxWidth: '100%',
            maxHeight: '90%',
            overflow: 'hidden',
        });

        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {
            width: '100%',
            height: '100%',
            border: 'none',
            overflow: 'hidden',
        });
        iframe.src = url;
        popupContainer.appendChild(iframe);

        const closeButton = document.createElement('div');
        closeButton.innerText = 'X';
        Object.assign(closeButton.style, {
            position: 'absolute',
            top: '0',
            right: '0',
            cursor: 'pointer',
            padding: '0.5em',
            backgroundColor: '#f00',
            color: '#fff',
            zIndex: '9999',
        });
        closeButton.addEventListener('click', () => {
            popupContainer.style.display = 'none';
        });

        document.body.appendChild(popupContainer);
    }

    // Adjust and display the popup
    const updatePopupSize = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const size = Math.min(viewportWidth, viewportHeight) * 0.60; 
        popupContainer.style.width = `${size}px`;
        popupContainer.style.height = `${size}px`;
        popupContainer.style.display = 'block';
    };

    window.addEventListener('resize', updatePopupSize);
    updatePopupSize();
};


//function call for popup, just add url
//createResponsivePopup('https://example.com');