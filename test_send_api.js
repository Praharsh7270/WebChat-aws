async function run() {
    try {
        const res = await fetch(`http://localhost:3000/api/messages/send/dummyid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'hello world' })
        });
        console.log(res.status, res.statusText);
        console.log(await res.text());
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
