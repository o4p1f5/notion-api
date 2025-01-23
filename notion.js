const { Client } = require("@notionhq/client");

const notion = new Client({ auth: "Notion API Key" })
const databaseId = "Notion DataBase ID";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

async function addItem(repositoryName, user, version, multiSelectOption, message) {
    try {
        const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
            "Repo": { 
                rich_text:[
                        {
                            "text": {
                                "content": repositoryName
                            }
                    }
                ]
            },
            "작업자": { 
                rich_text:[
                    {
                        "text": {
                            "content": user
                        }
                    }
                ]
            },
            "버전": { 
                rich_text:[
                    {
                        "text": {
                            "content": version
                        }
                    }
                ]
            },
            "구분": { 
                multi_select: multiSelectOption
            },
            "이력": { 
                rich_text: [
                    {
                        "text": {
                            "content": message
                        }
                    }
                ]
            },
        },
        })
        console.log(response)
        console.log("Success! Entry added.")
    } catch (error) {
        console.error(error.body)
    }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

async function main(args) {

    // Repo
    const repositoryName = args.repository.name;


    // user
    const senderUserId = args.event.payload.sender.user_id;


    // 이력
    let commitMessages = [];  // commitMessages를 함수의 상위에서 선언
    try {
        // 전달된 파라미터에서 이벤트 데이터 추출
        const event = args.event;
        if (!event || !event.payload || !event.payload.commits) {
            throw new Error("Invalid payload structure");
        }
        // 커밋 메시지 추출
        const commits = event.payload.commits;
        commitMessages = commits.map(commit => commit.commit_message);
    } catch (error) {
        console.error("Error processing commit_message:", error.message);
        // 에러 반환
    }

    // 구분
    const response = await notion.databases.retrieve({ database_id: databaseId });
    const multiSelectOptions = response.properties['구분'].multi_select.options;
    const options = [];
    for (let i = 0; i < multiSelectOptions.length; i++) {
        const option = multiSelectOptions[i].name
        
        if (commitMessages.length > 0 && commitMessages[0].includes(option)) {
            options.push({ name: option }); // 배열에 추가
        }
    }


    // 버전
    const response2 = await notion.databases.query(
        {
            database_id: databaseId,
            filter: {
                property: 'Repo',
                rich_text: {
                    equals: repositoryName, // 'test'를 포함하는 값 필터링
                },
            },
            sorts: [
                {
                    property: '버전', 
                    direction: 'descending', // 최신 값부터 정렬
                },
            ],
        }
    )
    
    let newVersion = ""
    if (response2.results.length === 0) {
        newVersion = "v.0.1.0"
    }
    else {
        const version = response2.results[0]?.properties["버전"]?.rich_text[0]?.text.content;
        
        let versionParts = version.slice(2).split('.').map(Number);
        // console.log(versionParts) // [ x, y, z ]
        if (options.length > 0 && options[0].name == 'release'){ // release(y,z 리셋)
            versionParts[0] += 1;
            versionParts[1] = 0;
            versionParts[2] = 0; 
            newVersion = 'v.' + versionParts.join('.');
        }
        else if (options.length > 0 &&options[0].name == 'feat'){ // feat(z 리셋)
            versionParts[1] += 1;  
            versionParts[2] = 0;  
            newVersion = 'v.' + versionParts.join('.');
        }
        else {
            versionParts[2] += 1;  
            newVersion = 'v.' + versionParts.join('.');
        }
    } 
    console.log(newVersion)

    addItem(repositoryName, senderUserId, newVersion, options, commitMessages[0]);
}

// NCP Cloud Function에서 main을 실행할 수 있도록 수정
exports.main = main;  // main 함수를 exports 객체에 할당