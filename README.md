# letsencrypt-auto-renew-godaddy
letsEncrypt 인증서를 서브도메인에 사용하는 경우에 `TXT RECORD`로 인증서를 생성 및 갱신해야하더라.

문제는 갱신할 때 마다 도메인 서비스에 등록한 `TXT RECORD`의 value를 바꿔줘야 해서 certbot-auto를 이용해서 갱신 자동화를 할 수가 없다.

그래서 현재 사용중인 `GoDaddy domain api`로 서브도메인 인증서 갱신 자동화를 진행하였다. (와일드카드 서브도메인도 적용 가능)


## 주의점
인증서 갱신시 godaddy의 record TTL은 600초다.

그래서 최소 10분이 걸리는데 테스트를 해 본 결과 실제로 반영되는데 15분쯤 걸렸다.

안전하게 반영하기 위해서 setTimeout으로 **20분이나** 딜레이를 걸어놓음

## prerequirement
- nodejs
- crontab


## 세팅

### .env
```sh
DOMAIN=도메인(서브도메인x)
API_KEY=API키
API_SECRET=API시크릿
```

### index.js
```js
// path를 위에서 생성한 .env 절대경로로 변경
dotenv.config({ path: '/usr/src/ssl-auto-renew/.env' });
```

### certbot_script.sh
- 인증서 갱신은 1시간에 5번까지만 가능하므로 `--dry-run`을 잘 이용할 것
- 만약 root 환경에서 모든 세팅을 진행한다면 NODE_PATH를 `$(which node)`로 대체 가능
```sh
#!/bin/bash

NODE_PATH=which node을 입력하여 나온 절대경로

INDEX_PATH=index.js의 절대경로

echo "[$(date '+%Y-%m-%d %H:%M:%S')] letsEncrypt renew start"

# --force-renewal이 없으면 만료일이 30일 이내일 때만 가능하다.
# 만약 만료일이 30일 이내일때만 갱신하고 싶으면 해당 옵션을 지울 것. 
certbot renew --force-renewal \
  --non-interactive \
  --preferred-challenges dns \
  --manual-auth-hook "$NODE_PATH $INDEX_PATH renew" \
  --manual-cleanup-hook "$NODE_PATH $INDEX_PATH cleanup" \
  # --dry-run # 인증서 갱신을 테스트하려면 이 부분의 주석을 풀어주세요.

echo "[$(date '+%Y-%m-%d %H:%M:%S')] letsEncrypt renew end"
```

### node_modules
```js
npm install
```

## crontab 등록
letsEncrypt 인증서가 root 권한으로 생성된 경우가 많기 때문에 root 권한으로 crontab에 스케쥴을 추가한다.
### 1. crontab 스크립트 파일 오픈
```sh
sudo crontab -e
```

### 2. 스크립트 작성
- 스크립트 작성은 vim 기준으로 진행하면 된다.
- 매 월 1일 자정에 실행된다.
- `프로젝트 절대경로 >> 로그파일 경로` 형식으로 되어있는데, 임의로 지정하면 된다.
- 로그 찍을 필요가 없다면 `0 0 1 * * sh (cerbot_script.sh 스크립트 경로)`만 적어줘도 충분하다.
```sh
0 0 1 * * sh /usr/src/ssl-auto-renew/certbot_script.sh >> /usr/src/cron-log/run.log 2>&1
```

### 3. 크론잡 등록되었는지 확인
```sh
sudo crontab -l
```
