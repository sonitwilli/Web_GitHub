This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
Link Figma: https://www.figma.com/design/XydKmcSzR1wNMQYp3cslbJ/%5BWeb%5D-Trang-ch%E1%BB%A7?node-id=1-4&p=f&t=8uBMB4OEkEDgu1GL-0

## Rules chung

- Dùng YARN, không được dùng NPM
- Bật ESLINT trong suốt quá trình dev
- Nếu có error bôi đỏ hoặc warning bôi vàng: phải fix trước khi commit
- Dùng chung config vscode với cả team
- Test trên cả window, macOs, android, ios trước khi merge code

## Rule push code

- Trước khi push code lên remote phải chạy command: yarn build-dev/ yarn build-staging/ yarn build-production
- Fix hết tất cả lỗi, warning trước khi push

## Rule Nextjs

- Sử dụng các function/component có sẵn của Nextjs
- KHÔNG dùng javascript để thao tác DOM
- Thêm prefetch=false vào tất cả thẻ component Link

## Quy tắc tên folder

- Viết thường: ví dụ folder
- Có thể dùng dấu gạch ngang nếu tên dài: ví dụ folder-name

## Quy tắc tên file component

- Viết hoa chữ cái đầu mỗi từ: ví dụ File.tsx
- Nếu tên dài: ví dụ FileName.tsx

## Quy tắc tên các file khác: file trong folder app, file javascript, font css,...

- Quy tắc: viết thường, nếu tên dài thì thêm gạch ngang giữa các từ
- Ví dụ: page.tsx, page-name.tsx, file.ts, file-name.ts. file.css, file-name.css

## Typescipt

- Luôn dùng typescipt, không dùng javascript
- Luôn khai báo type cho các biến
- KHÔNG dùng type any, ngoại trừ các case đặc biệt không thể xác định: error trong try catch, player,...
- LUÔN khai báo optional type

## Khai báo chuỗi

- Không hard-code tên chuỗi, ví dụ: localStorage.getItem('string')
- BẮT BUỘC khai báo tên chuỗi để tái sử dụng trong file lib\constant\texts.ts

## Khác

- Không dùng then().catch() ngoại trừ các case đặc biệt
- Luôn dùng async/await để xử lý Promise.
  ...
