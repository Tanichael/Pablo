document.addEventListener("DOMContentLoaded", async () => {
    const connectionClient = new ConnectionClient();

    const leftButton = document.getElementById('left-button-img');
    const rightButton = document.getElementById('right-button-img');
    const workElement = document.getElementById('work');
    const workBlock = document.getElementById('work-block');
  
    const workBlockManager = new WorkBlockManager(connectionClient, workBlock, workElement, leftButton, rightButton);
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
    constructor(connectionClient, workBlock, workElement, leftButton, rightButton) {
        this.connectionClient = connectionClient;
        this.workElementManager = new WorkElementManager(connectionClient, workElement);
        this.descriptionElementManager = new DescriptionElementManager(connectionClient);
        this.tempId = 1;

        workBlock.appendChild(this.descriptionElementManager.descriptionElement);

        this.workElementManager.show();
        this.descriptionElementManager.hide();

        leftButton.addEventListener('click', async () => {
            this.descriptionElementManager.hide();
            this.workElementManager.show();
            const workData = await this.getWork(this.getTempId()-1);
        });
    
        rightButton.addEventListener('click', async () => {
            this.descriptionElementManager.hide();
            this.workElementManager.show();
            const workData = await this.getWork(this.getTempId()+1);
        });

        this.workElementManager.workElement.addEventListener('click', () => {
            this.workElementManager.hide();
            this.descriptionElementManager.show();
        });

        this.descriptionElementManager.descriptionElement.addEventListener('click', () => {
            this.workElementManager.show();
            this.descriptionElementManager.hide();
        });

        this.getTempId = () => {
            return this.tempId;
        }

        this.getWork = async(id) => {
            const workData = await this.connectionClient.getWork(id);
            this.cacheWork(workData);
            return workData;
        }

        this.getRandWork = async(befId) => {
            const workData = await this.connectionClient.getRandWork(befId);
            this.cacheWork(workData);
            return workData;
        }

        this.cacheWork = (workData) => {
            this.workElementManager.workElement.src = this.getWorkUrlWithId(workData.id);
            this.descriptionElementManager.setWork(workData);
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

class DescriptionElementManager {
    constructor(connectionClient) {
        console.log("description manager");
        this.descriptionElement = document.createElement('div');
        this.descriptionElement.id = 'text';
        const title = document.createElement('p');
        title.id = 'title';
        title.textContent = '『モナ・リザ』';
        this.title = title;

        // creator要素の作成
        const creator = document.createElement('p');
        creator.id = 'creator';
        const creatorBold = document.createElement('b');
        creatorBold.textContent = 'レオナルド・ダ・ヴィンチ';
        const creatorItalic = document.createElement('i');
        creatorItalic.textContent = '/Leonardo da Vinci';
        creator.appendChild(creatorBold);
        creator.appendChild(creatorItalic);
        this.creator = creator;

        // description要素の作成
        const description = document.createElement('p');
        description.id = 'description';
        description.textContent = 'これはモナリザです。これはレオナルドダヴィンチの作品です。';
        this.description = description;

        // 要素をドキュメントに追加
        this.descriptionElement.appendChild(title);
        this.descriptionElement.appendChild(creator);
        this.descriptionElement.appendChild(description);

        this.hide = () => {
            this.descriptionElement.style.display = 'none';
        }

        this.show = () => {
            
            this.descriptionElement.style.display = 'block';
        }

        this.setWork = (workData) => {
            console.log("work data");
            this.title.textContent = workData.title;
            this.creator.textContent = workData.creator;
            this.description.textContent = workData.description;
        }
    }
}

class WorkElementManager {
    constructor(connectionClient, workElement) {
        this.connectionClient = connectionClient;
        this.workElement = workElement;
        // this.tempId = 1;

        this.hide = () => {
            this.workElement.style.display = 'none';
        }

        this.show = () => {
            this.workElement.style.display = 'block';
        }
    }
}