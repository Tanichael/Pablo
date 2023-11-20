document.addEventListener("DOMContentLoaded", async () => {
    const connectionClient = new ConnectionClient();

    const leftButton = document.getElementById('left-button-img');
    const rightButton = document.getElementById('right-button-img');
    const workElement = document.getElementById('work');

    const workBlockManager = new WorkBlockManager(connectionClient, workElement, leftButton, rightButton);
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

class WorkBlockManager {
    constructor(connectionClient, workElement, leftButton, rightButton) {
        this.workElementManager = new WorkElementManager(connectionClient, workElement);
        this.descriptionElementManager = new DescriptionElementManager(connectionClient);

        leftButton.addEventListener('click', async () => {
            const workData = await this.workElementManager.getWork(this.workElementManager.getTempId()-1);
        });
    
        rightButton.addEventListener('click', async () => {
            const workData = await this.workElementManager.getWork(this.workElementManager.getTempId()+1);
        });

        workElement.addEventListener('click', () => {
            console.log("work elemnt");
        });
    }
}

class DescriptionElementManager {
    constructor(connectionClient) {
        console.log("description manager");
    }
}

class WorkElementManager {
    constructor(connectionClient, workElement) {
        this.connectionClient = connectionClient;
        this.workElement = workElement;
        this.tempId = 1;

        this.getTempId = () => {
            return this.tempId;
        }

        this.getWork = async(id) => {
            const workData = await this.connectionClient.getWork(id);
            this.cacheWork(workData);
            this.workElement.src = this.getWorkUrlWithId(workData.id);
            return workData;
        }

        this.getRandWork = async(befId) => {
            const workData = await this.connectionClient.getRandWork(befId);
            this.cacheWork(workData);
            this.workElement.src = this.getWorkUrlWithId(workData.id);
            return workData;
        }

        this.cacheWork = (workData) => {
            this.tempId = workData.id;
            const jsonObj = JSON.stringify(workData);
            sessionStorage.setItem('work', jsonObj);
        }

        this.getCachedWork = async() => {
            const workStr = sessionStorage.getItem('work');
            const workData = JSON.parse(workStr);
            if(workData) {
                console.log(`workdata: ${JSON.stringify(workData)}`);
                workElement.src = this.getWorkUrlWithId(workData.id);
                return workData;
            } else {
                console.log("no cache");
                const randWorkData = await this.getRandWork(0);
                return randWorkData;
            }
        }

        this.getWorkUrlWithId = (id) => {
            return "../img/works/" + id + ".jpg";
        }

        this.getCachedWork().then(() => {
            console.log("cached work");
        });
    }
}