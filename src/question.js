import readline from 'node:readline';

export default (sQuestion) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, reject) => {
        rl.question(sQuestion, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};
