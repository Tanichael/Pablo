document.addEventListener("DOMContentLoaded", async () => {
    let tempId = 0;
    const connectionClient = new ConnectionClient();

    const leftButton = document.getElementById('left-button-img');
    const rightButton = document.getElementById('right-button-img');
    // const workBlock = document.getElementById('work-block');
    // const workElement = document.createElement('img');
    const workElement = document.getElementById('work');
    // workElement.id = "work";
    // workElement.width = "300"
    // workBlock.appendChild(workElement);

    const workData = await setRandWork(connectionClient, workElement, tempId);
    tempId = workData.id;

    workElement.addEventListener('click', () => {
       //workElement.src = "../static/img/works/1.jpg"
    });
    
    leftButton.addEventListener('click', async () => {
        const workData = await setWork(connectionClient, workElement, tempId-1);
        tempId = workData.id;
    });

    rightButton.addEventListener('click', async () => {
        const workData = await setWork(connectionClient, workElement, tempId+1);
        tempId = workData.id;
    });
});

class ConnectionClient {
    constructor() {
        this.getWork = async (id) => {
            const workUrl = '/work/' + id;
            const workResponse = await fetch(workUrl);
            if(!workResponse.ok) {
                throw new Error('error');
            }
            const workData = await workResponse.json();
            console.log(`workData: ${JSON.stringify(workData)}`);
            return workData;
        };

        this.getRandWork = async (befId) => {
            const randUrl = '/work/random/' + befId;
            const workResponse = await fetch(randUrl);
            if(!workResponse.ok) {
                throw new Error('error');
            }
            const workData = await workResponse.json();
            console.log(`workData: ${JSON.stringify(workData)}`);
            return workData;
        }
    }
}

async function setWork(connectionClient, workElement, id) {
    const workData = await connectionClient.getWork(id);
    workElement.src = getWorkUrlWithId(workData.id);
    return workData;
}

async function setRandWork(connectionClient, workElement, befId) {
    const workData = await connectionClient.getRandWork(befId);
    workElement.src = getWorkUrlWithId(workData.id);
    return workData;
}

function getWorkUrlWithId(id) {
    return "../img/works/" + id + ".jpg";
}