# Identiplante

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.3, updated to Angular 19.2.16.

Node v20 is needed.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Beta

Run `ng build --configuration beta --base-href=/appli:identiplante/` to build the project on production server. The build artifacts will be stored in the `dist/` directory.

You will need to copy the content of the `dist/identiplante/browser` on your server

Or authorize ssh connection and create a script `./deploy.sh beta`

## Build

Run `ng build --configuration production --base-href=/appli:identiplante/` to build the project on production server. The build artifacts will be stored in the `dist/` directory.

You will need to copy the content of the `dist/identiplante/browser` on your server

Or authorize ssh connection and create a script `./deploy.sh production`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
