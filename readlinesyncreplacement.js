import * as readline from 'node:readline/promises';  // This uses the promise-based APIs
import { stdin as input, stdout as output } from 'node:process';

async function fPrompt() {
    const rl = readline.createInterface({ input, output });

    const answer = await rl.question('What do you think of Node.js? ');

    console.log(`Thank you for your valuable feedback: ${answer}`);

    rl.close();
    return answer;
}

fPrompt().then((answer) => {
    console.log(`thanks again for ${answer} `)
})
