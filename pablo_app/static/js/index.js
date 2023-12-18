document.addEventListener("DOMContentLoaded", async () => {
    const connectionClient = new ConnectionClient();
    const leftButton = document.getElementById('left-button-img');
    const rightButton = document.getElementById('right-button-img');
    const workElement = document.getElementById('work-and-title-block');
    const workBlock = document.getElementById('work-block');
    // const subDescription = document.getElementsByClassName('test');
    const work = document.getElementById('work');

    const workBlockManager = new WorkBlockManager(connectionClient, workBlock, workElement, leftButton, rightButton);

    workBlockManager.getCachedWork().then(() => {
        console.log("cached work");
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

class WorkBlockManager {
    constructor(connectionClient, workBlock, workElement, leftButton, rightButton) {
        this.connectionClient = connectionClient;
        this.workElementManager = new WorkElementManager(connectionClient, workElement);
        this.descriptionElementManager = new DescriptionElementManager(connectionClient);
        this.tempId = 1;
        // this.subDescription = subDescription;
      
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

      //.hideを実行した後に要素の追加削除を行えばいいのではといじってみたのですがなんかうまくいきませんでした
        this.workElementManager.workElement.addEventListener('click', () => {
            this.workElementManager.hide();
            this.descriptionElementManager.show();

            // setTimeout(() => {
            // workBlock.insertBefore(this.descriptionElementManager.descriptionElement, workBlock.firstChild);
            // workBlock.removeChild(this.workElementManager.workElement);
            // // workBlock.removeChild(this.subDescription);
            // //何で消えないんだろう,,,]
            // },500);
            
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
            this.workElementManager.work.src = this.getWorkUrlWithId(workData.id);
            this.descriptionElementManager.setWork(workData);
            this.workElementManager.setWork(workData);
            this.tempId = workData.id;
            const jsonObj = JSON.stringify(workData);
            sessionStorage.setItem('work', jsonObj);
        }

        this.getCachedWork = async() => {
            const workStr = sessionStorage.getItem('work');
            const workData = JSON.parse(workStr);
            if(workData) {
                console.log(`workdata: ${JSON.stringify(workData)}`);
                this.workElementManager.work.src = this.getWorkUrlWithId(workData.id);
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
    }
}

class DescriptionElementManager {
    constructor(connectionClient) {
        console.log("description manager");
        this.descriptionElement = document.createElement('div');
        this.descriptionElement.id = 'text';
        this.descriptionElement.classList.add('card');
        
        //title要素の作成
        const title = document.createElement('p');
        title.id = 'title';
        title.textContent = '『モナリザ』';
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
            // this.descriptionElement.style.display = 'none';
            this.descriptionElement.classList.add('rotate');
        }

        this.show = () => {
            // this.descriptionElement.style.display = 'block';
            this.descriptionElement.classList.remove('rotate');
        }

        this.setWork = (workData) => {
            this.title.textContent = workData.title;
            this.creator.textContent = workData.creator.name;
            this.description.textContent = workData.description;
        }
    }
}

class WorkElementManager {
    constructor(connectionClient, workElement) {
        this.connectionClient = connectionClient;
        this.workElement = workElement;
        this.work = document.getElementById('work');
        console.log(`${this.work.src.toString()}`)
        // this.tempId = 1;

        const title = document.createElement('p');
        title.id = 'title_home';
        title.textContent = '『モナリザ』';
        this.title = title;
        const creator = document.createElement('p');
        creator.id = 'creator_home';
        const creatorBold = document.createElement('b');
        creatorBold.textContent = 'レオナルド・ダ・ヴィンチ';
        const creatorItalic = document.createElement('i');
        creatorItalic.textContent = '/Leonardo da Vinci';
        creator.appendChild(creatorBold);
        creator.appendChild(creatorItalic);
        this.creator = creator;

        this.workElement.appendChild(title);
        this.workElement.appendChild(creator);
      
        this.show = () => {
        // this.workElement.style.display = 'block';
          this.workElement.classList.remove('rotate');
        };

        this.hide = () => {
          this.workElement.classList.add('rotate');

        this.setWork = (workData) => {
            this.title.textContent = workData.title;
            this.creator.textContent = workData.creator.name;
          }
          
        };
    }
}
