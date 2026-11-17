# GitHub и hosting: подробнее

## GitHub через VS Code
Можно выполнить последовательность из корневого README в интегрированном PowerShell. GitHub Desktop — графическая альтернатива: Add an existing repository → выбрать папку → Publish repository. Перед публикацией проверьте `.gitignore`, отсутствие `.env`, токенов и личных тестовых данных. Сам публичный GitHub-репозиторий будет виден всем; это ожидаемая настройка проекта, проверьте, что вы не коммитите приватные документы.

## Настройка static host
- Build command: пусто / none.
- Output / publish directory: `dist`.
- Framework preset: None / static HTML.
- Не добавлять Node dependency install или Python server на production-хостинге.
- Добавить домен после первого успешного production deploy и применить DNS инструкции, выданные именно вашим провайдером.

Сайт использует hash routes (`#/commerce`), поэтому прямые внутренние URL остаются одним физическим `/` документом. Python в README нужен только для локального сервера на Windows; production-файлы хостятся статически.
