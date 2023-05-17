import readline from 'node:readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export default (sQuestion) => {
    return new Promise((resolve, reject) => {
        rl.question(sQuestion, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};
