'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
* */
const vscode = require('vscode');
const {InteractiveWebviewGenerator} = require('./interactiveWebview.js');
const settings = require('../../settings');

var semver = require('semver');

const SKIP_VERSIONS = {
    "0.0.25":function(lastSeenVersion){                         //extensionversion is 0.0.25
        return semver.satisfies(lastSeenVersion, ">=0.0.24");    //skip if last seen version was 0.0.24 or greater
    },
    "0.0.29":function(lastSeenVersion){                         //extensionversion is 0.0.29
        return semver.satisfies(lastSeenVersion, ">=0.0.28");    //skip if last seen version was 0.0.28 or greater
    }
};

const MESSAGE = `[<img width="130" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>



Thanks for using **Solidity Visual Developer** 🤜🤛

___
**⚠️ Note**: Make this extension fit your needs! Show/Hide/Enable/Disable features in \`preferences → Settings → Solidity Visual Developer: solidity-va.*\`
___

### What's New?

The complete changelog can be found [here](https://github.com/ConsenSys/vscode-solidity-auditor/blob/master/CHANGELOG.md). 


## v0.1.0 - with a lot of new features 🥳

- new: 🥳 major parser refactoring #67 and we published the parser as standalone lib "[solidity-workspace](https://github.com/tintinweb/solidity-workspace)"
- new: ⚠️ annotations for potential external calls (yellow gutter icon)
    - best effort - might miss some external calls depending on whether it is possible to easily resolve them (e.g. accessing addresses in nested structures/mappings).
- new: cockpit view that lists external calls in the currently selected contract (click into a contract in the editor for the view to update)

  ![image](https://user-images.githubusercontent.com/2865694/122222447-90933880-ceb2-11eb-91c3-c59549d40c8c.png)

- new: we can now resolve inherited names (hover: declaration link)
  
  ![image](https://user-images.githubusercontent.com/2865694/120014274-26d5ec00-bfe2-11eb-99f7-64d4a57277a0.png)

- new: we now decorate identifiers that are storage references (treating them like state-vars)
- new: unit-test stub/template for Hardhat/Ethers #70 (\`preferences → Settings → Solidity Visual Developer: solidity-va.test.defaultUnittestTemplate\`)
- new: (debug) option to enable/disable stacktraces for parser errors (\`preferences → Settings → Solidity Visual Developer: solidity-va.debug\`)
- new: show codelenses (inline actions) for abstract contracts
- new: customize which codelenses to show or hide (\`preferences → Settings → Solidity Visual Developer: solidity-va.codelens.*\`) #76
- new: expose new command \`solidity-va.surya.graphThis\` #76
- new: use internal ("dumb" lexical) flattener by default. Optionally allow to select \`truffle-flattener\` (\`preferences → Settings → Solidity Visual Developer: solidity-va.flatten.mode\`)
- update: enable \`draw.io csv export\` codelens by default
- fix: misplaced decoration when document changes
- fix: function selector is incorrect if there's a comment in the function signature definition #68
- update: code cleanup; refactored decoration logic and moved it to its own submodule


<sub>
Note: This notification is only shown once per release. Disable future notification? \`settings → solidity-va.whatsNew.disabled : true\`
</sub>
___
<sub>
Thinking about smart contract security? We can provide training, ongoing advice, and smart contract auditing. [Contact us](https://diligence.consensys.net/contact/).
</sub>
`;


class WhatsNewHandler {

    async show(context){

        let extensionVersion = settings.extension().packageJSON.version;
        let config = settings.extensionConfig();

        let lastSeenVersion = context.globalState.get("solidity-va.whatsNew.lastSeenVersion");
        if(config.whatsNew.disabled){ 
            return;
        }

        if(lastSeenVersion){
            // what's new msg seen before
            if(semver.satisfies(lastSeenVersion, ">=" + extensionVersion)){
                // msg seen
                console.log(">=" + extensionVersion);
                return;
            }

             //skip if previous version what's new has been seen
            let check_skip_fn = SKIP_VERSIONS[extensionVersion];
            if(check_skip_fn && check_skip_fn(lastSeenVersion)){
                console.log("Skipping what's new for:" +extensionVersion);
                return;
            }
        }

        await this.showMessage(context);
    }

    async showMessage(context) {
        let doc = {
            uri:"unknown",
        };


        let webview = new InteractiveWebviewGenerator(context, "whats_new");
        webview.revealOrCreatePreview(vscode.ViewColumn.Beside, doc)
            .then(webpanel => {
                webpanel.getPanel().webview.postMessage({
                    command:"render", 
                    value:{
                        markdown:MESSAGE,
                    }
                });
            });
        
        context.globalState.update("solidity-va.whatsNew.lastSeenVersion", settings.extension().packageJSON.version);
    }
}

module.exports = {
    WhatsNewHandler:WhatsNewHandler
};