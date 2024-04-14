start-all: start-user start-gateway start-library start-notification
start-user:
	cd user && start npm run dev 
	# gnome-terminal --working-directory=user -e "npm run dev"
start-gateway:
	cd gateway && start npm run dev 
	# gnome-terminal --working-directory=gateway -e "npm run dev"

start-library:
	cd library && start npm run dev 
	# gnome-terminal --working-directory=library -e "npm run dev"

start-notification:
	export ENVIRONMENT=dev && cd Notification && start go run main.go &
	# gnome-terminal --working-directory=Notification -e "go run cmd/main.go"
