# Etapa 1: Build de la aplicación
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dar permisos de ejecución al script mvnw
RUN chmod +x mvnw

# Descargar dependencias en caché
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente y compilar el archivo JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen final para ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]