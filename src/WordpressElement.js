import { startPlaygroundWeb, login } from '@wp-playground/client';

class WordpressElement extends HTMLElement{
    constructor(){
        super();
    }
    async connectedCallback(){
        this.innerHTML = `<iframe id="wordpress" credentialless style="width:100%;height:100vh"></iframe>`;
        const client = await startPlaygroundWeb({
         iframe: document.querySelector('iframe#wordpress'),
         remoteUrl: "https://playground.wordpress.net/remote.html" }
        );
        // Let's wait until Playground is fully loaded
        await client.isReady();
        // Great! Let's navigate to "Sample Page":
        await client.goTo("/?page_id=2");
    }
}

customElements.define("x-wordpress", WordpressElement);