document.addEventListener("DOMContentLoaded", async () => {
    const connectionClient = new ConnectionClient();
    const leftButton = document.getElementById('left-button-img');
    const rightButton = document.getElementById('right-button-img');
    const workElement = document.getElementById('work-and-title-block');
    const workBlock = document.getElementById('work-block');
    // const subDescription = document.getElementsByClassName('test');
    const work = document.getElementById('work');
    // const body = document.getElementsByTagName('body');

    const workBlockManager = new WorkBlockManager(connectionClient, workBlock, workElement, leftButton, rightButton);

    workBlockManager.getCachedWork().then(() => {
        console.log("cached work");
    });

    const commentUlBlock = document.getElementById('comment-block-list');
    const commentUlBlockHolder = new CommentUlBlockHolder(connectionClient, commentUlBlock);

    const tempWorkData = await workBlockManager.getCachedWork();
    const tempWorkId = tempWorkData.id;
    connectionClient.getCommentByWorkId(tempWorkId).then((comments) => {
        console.log(`comments ${JSON.stringify(comments)}`)
        commentUlBlockHolder.setComments(comments);
    });

    //コメント送信処理
    const commentFormManager = new CommentFormManager();

    //Debug
    // document.addEventListener('keydown', async (event) => {
    //     if(event.key === 't') {
    //         likeData = await connectionClient.postLike(1);
    //         console.log(`likeData: ${JSON.stringify(likeData)}`);
    //     }
    // });
});

class CommentFormManager {
    constructor() {
        const commentForm = document.getElementById('send-comment-form');
        const sendCommentButton = document.getElementById('send-comment-button');
        const commentUserId = document.getElementById('comment-post-user-id');
        const commentWorkId = document.getElementById('comment-post-work-id');
        const commentPlace = document.getElementById('comment-from-user');

        commentPlace.addEventListener('keydown', (event) => {
            if(event.key === 'Enter') {
                event.preventDefault();
                this.postForm();
            }
        });

        sendCommentButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.postForm();
        });

        this.postForm = () => {
            const userIdValue = 1; //本来はここでユーザーIDを取得する -> flask側で処理するので不要
            commentUserId.value = userIdValue;
            const workStr = sessionStorage.getItem('work');
            const workData = JSON.parse(workStr);
            const workIdValue = workData.id;
            commentWorkId.value = workIdValue;
            const commentValue = commentPlace.value;
            //コメントが有効か確認
            if(commentValue == '') {
                console.log('コメントが空白です');
                return;
            }
            commentForm.submit();
        }
    }
}

class CommentUlBlockHolder {
    constructor(connectionClient, ulBlock) {
        this.connectionClient = connectionClient;
        this.ulBlock = ulBlock;

        this.setComments = (comments) => {
            while(this.ulBlock.firstChild) {
                this.ulBlock.removeChild(this.ulBlock.firstChild);
            }

            comments.forEach((comment) => {
                const li = document.createElement('li');
                li.className = 'comment';
                const commentUserDiv = document.createElement('div');
                commentUserDiv.className = "comment-user";
                const commentUserHolder = new CommentUserHolder(commentUserDiv, comment);
                li.appendChild(commentUserDiv);
                this.ulBlock.appendChild(li);
            });
        }

        document.addEventListener('work-cached', async (e) => {
            const workData = e.detail;
            const new_comments = await this.connectionClient.getCommentByWorkId(workData.id);
            this.setComments(new_comments);
        });
    }
}

class CommentUserHolder {
    constructor(commentBlock, comment) {
        this.commentBlock = commentBlock;

        this.commentNameDiv = document.createElement('div');
        this.commentNameDiv.className = 'comment-name';
        this.commentNameDiv.textContent = comment.user_name;
      
        this.commentElementDiv = document.createElement('div');
        this.commentElementDiv.className = 'comment-element';
        this.commentElementDiv.textContent = comment.comment; 
        
        this.commentBlock.appendChild(this.commentNameDiv);
        this.commentBlock.appendChild(this.commentElementDiv);
    }
}

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

        this.getCommentByUserId = async (userId) => {
            const commentUrl = '/comment/get/user=' + userId.toString();
            const commentResponse = await fetch(commentUrl);
            if(!commentResponse.ok) {
                throw new Error('error');
            }
            const commentData = await commentResponse.json();
            return commentData;
        }

        this.getCommentByWorkId = async (workId) => {
            const commentUrl = '/comment/get/work=' + workId.toString();
            const commentResponse = await fetch(commentUrl);
            if(!commentResponse.ok) {
                throw new Error('error');
            }
            const commentData = await commentResponse.json();
            return commentData;
        }

        this.postLike = async(commentId) => {
            const postLikeUrl = '/like/post';
            const formData = new FormData();
            formData.append('comment_id', commentId);
            const likeResponse = await fetch(postLikeUrl, {
                method: "POST",
                body: formData
            });
            if(!likeResponse.ok) {
                throw new Error('error');
            }
            const likeData = await likeResponse.json();
            return likeData;
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

        // body.appendChild(this.descriptionElementManager.descriptionElement);
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
            this.descriptionElementManager.showDescription();
            this.workElementManager.hovered();
            // this.workElementManager.hide();
            // this.descriptionElementManager.show();
            // this.workElementManager.dishovered();
            // setTimeout(() => {
            // workBlock.insertBefore(this.descriptionElementManager.descriptionElement, workBlock.firstChild);
            // workBlock.removeChild(this.workElementManager.workElement);
            // // workBlock.removeChild(this.subDescription);
            // //何で消えないんだろう,,,]
            // },500);
            
        });

        this.workElementManager.workElement.addEventListener('mouseover', () =>{
            this.workElementManager.hovered();
        }) ;
        this.workElementManager.workElement.addEventListener('mouseout', () =>{
            this.workElementManager.dishovered();
        }) ;

        // this.descriptionElementManager.descriptionElement.addEventListener('click', () => {
        //     this.workElementManager.show();
        //     this.workElementManager.dishovered();
        //     this.descriptionElementManager.hide();
        // });


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
            const workCachedEvent = new CustomEvent("work-cached", {
                detail: workData
            });
            document.dispatchEvent(workCachedEvent);
            // this.descriptionElementManager.setWork(workData);
            // this.workElementManager.setWork(workData);
            this.tempId = workData.id;
            const jsonObj = JSON.stringify(workData);

            sessionStorage.setItem('work', jsonObj);
        }

        this.getCachedWork = async() => {
            const workStr = sessionStorage.getItem('work');
            const workData = JSON.parse(workStr);
            if(workData) {
                // console.log(`workdata: ${JSON.stringify(workData)}`);
                this.workElementManager.setWork(workData);
                return workData;
            } else {
                console.log("no cache");
                const randWorkData = await this.getRandWork(0);
                return randWorkData;
            }
        }
    }
}

class DescriptionElementManager {
    constructor(connectionClient, workElement) {
        console.log("description manager");
      
        // this.connectionClient = connectionClient;
        // this.workElement = workElement;
        // this.workElementManager = new WorkElementManager(connectionClient, workElement);

        // this.workElementManager = new WorkElementManager(connectionClient, workElement);
      
        this.descriptionElement = document.createElement('div');
        this.descriptionElement.id = 'pop_up_cover';
        // this.descriptionElement.classList.add('card');
        this.descriptionElement.classList.add('hidden');
        // this.overlay = document.createElement('div')；
        // this.overlay.id  = 'overlay'；

        const descriptionWindow = document.createElement('div');
        descriptionWindow.id = 'work-and-description-block';
        this.descriptionWindow = descriptionWindow;
      
        const descriptionWindowText = document.createElement('div');
        descriptionWindowText.id = 'text-in-description';
        this.descriptionWindowText = descriptionWindowText;
      
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
        description.textContent = 'モナリザの最も特徴的な要素は、彼女の微笑みです。これは非常に微妙で神秘的であり、観察者に対して感情の複雑な表現をもたらしています。彼女の眼差しも同様に深く、視線を感じるがどこを見ているのかはっきりしないため、絵画には謎めいた雰囲気が漂っています。モナリザのポーズも注目に値します。彼女は軽く横たわり、観察者に対して軽く微笑みかけながら見つめています。レオナルド・ダ・ヴィンチは、この絵画において達成されたリアリズムと光の効果により、モナリザを生き生きとした存在として描き出しました。';
        this.description = description;

        // Year要素の作成
        const year = document.createElement('p');
        year.id = 'year';
        year.textContent = '1503-1519';
        this.year = year;

        // Museum要素の作成
        const museum = document.createElement('p');
        museum.id = 'museum';
        museum.textContent = 'ルーブル美術館';
        this.museum = museum;

        // Size要素の作成
        const size = document.createElement('p');
        size.id = 'size';
        size.textContent = '77cm×53cm';
        this.size = size;

        // Kind要素の作成
        const kind = document.createElement('p');
        kind.id = 'kind';
        kind.textContent = 'ポプラ板に油彩';
        this.kind = kind;
      
        // テキストブロックに子要素を追加
        this.descriptionWindowText.appendChild(creator);
        this.descriptionWindowText.appendChild(year);
        this.descriptionWindowText.appendChild(museum);
        this.descriptionWindowText.appendChild(size);
        this.descriptionWindowText.appendChild(kind);
        this.descriptionWindowText.appendChild(title);
        this.descriptionWindowText.appendChild(description);

        // 作品画像要素の作成
        const workInDescriptionBlock = document.createElement('div');
        workInDescriptionBlock.id = 'work-in-description';
        this.workInDescriptionBlock= workInDescriptionBlock;

        const workInDescription = document.createElement('img');
        workInDescription.id = 'work-in-description-img';
        workInDescription.src = 'img/works/1.jpg';
        // this.workInDescription.src = this.workElementManager.getWorkUrlWithId(temp.id);
        workInDescription.alt = 'モナリザ';
        this.workInDescriotipn = workInDescription;

        // 作品画像を作品ブロックに追加
        this.workInDescriptionBlock.appendChild(workInDescription);

        // 親要素に子要素を追加
        this.descriptionWindow.appendChild(descriptionWindowText);
        this.descriptionWindow.appendChild(workInDescriptionBlock);      
        this.descriptionElement.appendChild(descriptionWindow);  

        this.hide = () => {
            // this.descriptionElement.style.display = 'none';
            // this.descriptionElement.classList.add('rotate');
        }

        this.show = () => {
            // this.descriptionElement.style.display = 'block';
            // this.descriptionElement.classList.remove('rotate');
        };

        this.showDescription = () =>{
            this.descriptionElement.classList.remove('hidden');
            this.descriptionElement.classList.add('show');
        };


        this.hideDescription = () =>{
            this.descriptionElement.classList.remove('show');
            this.descriptionElement.classList.add('hidden');
        };

        this.setWork = (workData) => {
            this.title.textContent = workData.title;
            this.creator.textContent = workData.creator.name;
            this.description.textContent = workData.description;
        }

        document.addEventListener('work-cached', (e) => {
            const workData = e.detail;
            this.setWork(workData);
        });

        this.descriptionElement.addEventListener('click', () => {
            this.hideDescription();
         });
    }
}

class WorkElementManager {
    constructor(connectionClient, workElement) {
        this.connectionClient = connectionClient;
        this.workElement = workElement;
        this.work = document.getElementById('work');
        console.log(`${this.work.src.toString()}`)
        // this.tempId = 1;

        const workStr = sessionStorage.getItem('work');
        const workData = JSON.parse(workStr);

        const title = document.createElement('p');
        title.id = 'title_home';
        title.textContent = 'workData.title';
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
          // this.workElement.classList.remove('rotate');
        };

        this.hide = () => {
          // this.workElement.classList.add('rotate');
          this.workElement.classList.remove('hovered');
        };

        this.hovered = () =>{
          this.workElement.classList.add('hovered');
        };
      
        this.dishovered = () =>{
          this.workElement.classList.remove('hovered');
        };

        this.setWork = (workData) => {
            this.work.src = this.getWorkUrlWithId(workData.id);
            this.title.textContent = workData.title;
            this.creator.textContent = workData.creator.name;
        }

        document.addEventListener('work-cached', (e) => {
            const workData = e.detail;
            this.setWork(workData);
        });

        this.getWorkUrlWithId = (id) => {
            return "../img/works/" + id + ".jpg";
        }
    }
}

// class DataStorage {
//   constructor() {
//     this.workData = {};
//   }
// }