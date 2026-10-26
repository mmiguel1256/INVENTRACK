# Guía Completa de Testing en el Ciclo de Vida DevOps (INVENTRACK)

Esta guía documenta de manera exhaustiva y sin omisiones cómo implementar, ejecutar y sustentar la fase de **Testing** del ciclo de vida de DevOps en el proyecto **INVENTRACK**, funcionando de manera **100% local** (sin requerir GitHub ni Docker).

---

## 1. Fundamentos Teóricos para la Exposición

### ¿Dónde entra el Testing en DevOps?
En el ciclo infinito de DevOps:
$$\text{Plan} \rightarrow \text{Code} \rightarrow \mathbf{Build} \rightarrow \mathbf{Test} \rightarrow \text{Release} \rightarrow \text{Deploy} \rightarrow \text{Operate} \rightarrow \text{Monitor}$$

* **Continuous Testing (Pruebas Continuas):** Se realizan de forma automatizada cada vez que se produce un cambio en el código.
* **Fail Fast (Fallar Rápido):** Principio de DevOps que dicta que si hay un error o fallo de seguridad, el ciclo debe detenerse de inmediato en la etapa más temprana posible para reducir costos y riesgos.
* **Quality Gates (Puertas de Calidad):** Criterios automáticos (como porcentaje de cobertura de código y 0 tests fallidos) que determinan si el código está apto para pasar a producción.

### Herramientas Utilizadas
1. **JUnit 5:** Framework estándar de pruebas automatizadas para Java. No requiere instalación en el sistema operativo; se gestiona automáticamente mediante Maven.
2. **JaCoCo (Java Code Coverage):** Plugin de análisis dinámico que mide la eficacia y cobertura del código fuente durante la ejecución de los tests. Genera reportes métricos y visuales en HTML.
3. **Maven Wrapper (`mvnw`):** Automatizador del ciclo de vida del proyecto (compilación, ejecución de tests y empaquetado).

---

## 2. Paso a Paso Detallado de Implementación

### Paso 2.1: Modificar `pom.xml` para incluir JaCoCo
Abre el archivo `pom.xml` ubicado en la raíz del proyecto. Localiza la etiqueta `<plugins>` y agrega el plugin de JaCoCo.

**Fragmento a agregar dentro de `<build><plugins> ... </plugins></build>`:**
```xml
			<!-- PLUGIN DEVOPS: JaCoCo para Cobertura de Pruebas -->
			<plugin>
				<groupId>org.jacoco</groupId>
				<artifactId>jacoco-maven-plugin</artifactId>
				<version>0.8.12</version>
				<executions>
					<execution>
						<goals>
							<goal>prepare-agent</goal>
						</goals>
					</execution>
					<execution>
						<id>report</id>
						<phase>test</phase>
						<goals>
							<goal>report</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
```

---

### Paso 2.2: Crear el Archivo de Pruebas Unitarias
Crea la siguiente ruta de directorios si no existe:
`src/test/java/com/inventrack/api/security/`

Dentro de esa carpeta, crea el archivo **`JwtUtilsTest.java`**:

```java
package com.inventrack.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias de Seguridad JWT - Fase DevOps Testing")
class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // Clave secreta fija de 256 bits para el entorno de testing
        String secretClavePruebas = "NTM2NzU2NkI1OTcwMzNzNjc2Mzk3OTJGNkIyRjQ1MjgwNDgrNEQ2MjUxNmU1NDY4NTdtNWE3MTM0NzQ3";
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", secretClavePruebas);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000); // 1 hora
    }

    @Test
    @DisplayName("DevOps Gate 1: Validación de token vacío o nulo")
    void testValidarTokenVacioDebeRetornarFalse() {
        boolean esValido = jwtUtils.validateJwtToken("");
        assertFalse(esValido, "Un token vacío debe ser rechazado inmediatamente");
    }

    @Test
    @DisplayName("DevOps Gate 2: Validación de token con formato malicioso o corrupto")
    void testValidarTokenCorruptoDebeRetornarFalse() {
        boolean esValido = jwtUtils.validateJwtToken("token.falso.corrupto123");
        assertFalse(esValido, "Cualquier token alterado o corrupto debe retornar false");
    }
}
```

---

### Paso 2.3: Crear el Script Automatizado del Pipeline Local
En la carpeta raíz del proyecto (`INVENTRACK-Backend`), crea el archivo:
**`pipeline-devops-test.bat`**

Contenido del archivo:
```bat
@echo off
cls
color 0B
echo =====================================================================
echo           PIPELINE DEVOPS AUTOMATIZADO - FASE DE TESTING
echo =====================================================================
echo.
echo [1/3] FASE BUILD: Compilando codigo fuente...
call .\mvnw.cmd compile
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR CRITICO DEVOPS] La compilacion fallo. Pipeline detenido.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] FASE TEST: Ejecutando pruebas unitarias con JUnit 5 y JaCoCo...
call .\mvnw.cmd test
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR CRITICO DEVOPS] Una o mas pruebas fallaron. Quality Gate RECHAZADO.
    echo El codigo NO es apto para continuar a Release/Deploy.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] FASE QUALITY GATE: Generando y publicando reporte de metricas JaCoCo...
color 0A
echo.
echo =====================================================================
echo   QUALITY GATE APROBADO CON EXITO: 0 FALLOS DETECTADOS
echo =====================================================================
echo Abriendo reporte de cobertura de codigo en el navegador...
start target\site\jacoco\index.html
pause
```

---

## 3. Procedimiento de Ejecución

1. Abre una terminal de **PowerShell** o **CMD** en la carpeta raíz del backend (`c:\Users\PERSONAL\Downloads\INVENTRACK-Backend`).
2. Ejecuta el script del pipeline:
   ```powershell
   .\pipeline-devops-test.bat
   ```
3. Observa la salida en consola:
   * **Fase 1:** Maven compila las clases.
   * **Fase 2:** Ejecuta `JwtUtilsTest`, mostrando `Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`.
   * **Fase 3:** Se genera el reporte en `target/site/jacoco/index.html` y se abre automáticamente en tu navegador predeterminado.

---

## 4. Guion y Estructura para la Exposición en Clase

| Tiempo | Qué decir | Qué mostrar en pantalla |
| :--- | :--- | :--- |
| **Paso 1: Introducción** | *"En DevOps, la fase de Testing no es manual: es continua y automatizada mediante Continuous Integration (CI). Aplicamos el principio Fail Fast para garantizar que código con errores no avance a producción."* | El diagrama del ciclo DevOps haciendo énfasis en la etapa **TEST**. |
| **Paso 2: Herramientas** | *"Presentamos dos herramientas clave: **JUnit 5**, que ejecuta las pruebas funcionales, y **JaCoCo**, una herramienta DevOps para medir la métrica de Code Coverage (cobertura de código)."* | Mostrar el archivo `pom.xml` con el plugin de JaCoCo y el test `JwtUtilsTest.java`. |
| **Paso 3: Demostración en Vivo** | *"Ejecutamos nuestro pipeline automatizado local con un solo comando."* | Ejecutar `.\pipeline-devops-test.bat`. Mostrar cómo la consola compila y corre los tests en verde. |
| **Paso 4: Análisis del Reporte** | *"Aquí vemos el reporte generado por JaCoCo: nos muestra con precisión las líneas probadas en verde y las ramas no cubiertas en rojo, sirviendo como Quality Gate objetivo."* | Navegar en el reporte HTML abierto en el navegador, entrando al paquete `com.inventrack.api.security` y a la clase `JwtUtils`. |
| **Paso 5: Demostración de Error (Quality Gate)** | *"Para demostrar el principio Fail Fast: si un desarrollador introduce un error o se rompe una regla de negocio..."* Cambiar en `JwtUtilsTest.java` `assertFalse` por `assertTrue`. Volver a correr el `.bat`. Mostrar cómo el pipeline se detiene en **ROJO** y bloquea el despliegue. | Consola en rojo mostrando el fallo y el bloqueo del ciclo. |
