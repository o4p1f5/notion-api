# Notion 릴리즈노트 자동 업데이트
- Git : NCP SourceCommit
- NCP CloudFunction
- Notion API

1. NCP Source Commit
   - Notion 릴리즈노트에 기록할 레파지토리에 Webhook으로 Cloud Function 연결
   - 레파지토리 Push 시, Cloud Function 트리거 동작
     
2. NCP CloudFunction
   - 트리거 발동 시, 액션 동작
   - 액션에는 Notion API를 통해 Notion에 릴리즈노트를 기록하는 Nodejs 코드가 Zip 파일로 등록되어있음
   - Nodejs 코드 참고
     
3. Notion API
   - Notion DataBase에 Page 추가
   - 표 형식
   - 속성 : Repo, 작업자, 버전, 일시(자동등록), 구분, 이력, 자세한 설명
     ![image](https://github.com/user-attachments/assets/46b1e7e1-702d-4416-afc9-879c35957eda)
