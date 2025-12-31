game-up:
	docker compose -f docker-compose.yml up -d --build

game-down:
	docker compose -f docker-compose.yml down

LLB-rpc-issue:
	rm ~/.docker/config.json