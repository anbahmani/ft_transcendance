all:
	docker compose build &&\
	docker compose up -d

reset:
	docker exec app npm run reset

mac:
	COMPOSE_DOCKER_CLI_BUILD=1 \
	DOCKER_BUILDKIT=1 \
	DOCKER_DEFAULT_PLATFORM=linux/arm64/v8 \
	docker compose build &&\
	docker compose up -d
logs:
	docker logs postgres &&\
	docker logs app

refresh:
	docker exec app npm run build

prisma:
	docker exec app npm run prisma

studio:
	docker exec app npm run studio

clean:
	docker container stop postgres app &&\
	docker network rm api

fclean: clean
	@docker system prune -af

re: fclean all

.Phony: all logs clean fclean
