# Etapa 1: Build de la aplicación
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar archivos de dependencias para aprovechar la caché de Docker
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente y compilar el archivo JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen final para ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar el JAR generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Puerto por defecto expuesto por el contenedor
EXPOSE 8080

# Variables de entorno por defecto
ENV PORT=8080

# Comando de arranque de la aplicación
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]