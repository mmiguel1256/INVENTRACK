# MANUAL COMPLETO: TESTING EN EL CICLO DE VIDA DEVOPS (INVENTRACK)

Este documento contiene la explicación exhaustiva de la fase de **Testing** dentro de DevOps aplicada al backend de **INVENTRACK**. Explica qué herramientas usamos, cómo funcionan internamente, **dónde se ven reflejadas exactamente en el código (con nombres de clases, líneas y ejemplos visuales)**, la ruta exacta para ver cada elemento y el guion pedagógico paso a paso para exponerlo ante una clase o jurado.

---

## 1. El Rol del Testing en el Ciclo de Vida DevOps

En la ingeniería de software tradicional, las pruebas se realizaban al final del desarrollo (modelo en cascada). En **DevOps**, el testing cambia radicalmente bajo el concepto de **Continuous Testing (Pruebas Continuas)** y **Shift-Left Testing (Probar lo antes posible)**.

### El Ciclo Infinito de DevOps:
$$\text{Plan} \longrightarrow \text{Code} \longrightarrow \mathbf{Build} \longrightarrow \mathbf{Test} \longrightarrow \text{Release} \longrightarrow \text{Deploy} \longrightarrow \text{Operate} \longrightarrow \text{Monitor}$$

1. **Continuous Integration (CI):** Cada vez que un desarrollador termina un fragmento de código, este se integra, se compila y se somete a pruebas automatizadas de inmediato.
2. **Fail Fast (Fallar Rápido):** Si un cambio rompe una funcionalidad o introduce una vulnerabilidad, el sistema debe alertar en cuestión de segundos, deteniendo el ciclo antes de compilar el binario final.
3. **Quality Gates (Puertas de Calidad):** Condiciones automáticas e inquebrantables. Ejemplo: *"Ningún código se despliega si tiene 1 solo test fallido o si su cobertura es menor al umbral fijado"*.

---

## 2. Herramientas Utilizadas, Funcionamiento y Dónde se Reflejan en el Código

No se requiere instalar software adicional en el sistema operativo; todo el ecosistema de testing está gobernado mediante dependencias declarativas en Java:

### 2.1. JUnit 5 (Framework de Ejecución de Pruebas)
* **Qué es:** Es el estándar de la industria en Java para escribir y ejecutar pruebas unitarias y de integración.
* **Dónde se declara:** En [pom.xml](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/pom.xml#L56) mediante la dependencia `spring-boot-starter-test`.
* **Dónde se ve reflejado en el código del proyecto:**
  Se encuentra directamente en el archivo de prueba:
  👉 **`src/test/java/com/inventrack/api/security/JwtUtilsTest.java`**

#### Ejemplos concretos de anotaciones y aserciones en el código:

1. **Anotación `@DisplayName` (Línea 10):**
   * *Uso en el código:*
     ```java
     @DisplayName("Pruebas Unitarias de Seguridad JWT - Fase DevOps Testing")
     class JwtUtilsTest {
     ```
   * *Para qué sirve:* Le da un nombre legible y profesional a la suite de pruebas para que en la consola y en los reportes no aparezca solo código crudo.

2. **Anotación `@BeforeEach` (Línea 15):**
   * *Uso en el código:*
     ```java
     @BeforeEach
     void setUp() {
         jwtUtils = new JwtUtils();
         String secretClavePruebas = "NTM2NzU2NkI1OTcwMzNzNjc2Mzk3OTJGNkIyRjQ1MjgwNDgrNEQ2MjUxNmU1NDY4NTdtNWE3MTM0NzQ3";
         ReflectionTestUtils.setField(jwtUtils, "jwtSecret", secretClavePruebas);
         ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000);
     }
     ```
   * *Para qué sirve:* Garantiza el principio de **aislamiento de pruebas**. Se ejecuta automáticamente **antes de cada una** de las pruebas para inicializar un objeto limpio con una clave de prueba y un tiempo de expiración controlado.

3. **Anotación `@Test` (Líneas 23 y 30):**
   * *Uso en el código:*
     ```java
     @Test
     @DisplayName("DevOps Quality Gate 1: Validación de token vacío o nulo")
     void testValidarTokenVacioDebeRetornarFalse() { ... }
     ```
   * *Para qué sirve:* Le indica al motor de JUnit que este método específico es un caso de prueba ejecutable de forma automatizada.

4. **Aserciones `assertFalse(...)` (Líneas 26 y 33):**
   * *Uso en el código:*
     ```java
     boolean esValido = jwtUtils.validateJwtToken("");
     assertFalse(esValido, "Un token vacío debe ser rechazado inmediatamente");
     ```
   * *Para qué sirve:* Es la condición de éxito del Quality Gate. Si `validateJwtToken("")` llega a retornar `true`, la aserción lanza una excepción `AssertionError` y detiene el pipeline DevOps.

---

### 2.2. Código de Producción Evaluado (`JwtUtils.java`)
* **Dónde está:** 👉 **`src/main/java/com/inventrack/api/security/JwtUtils.java`**
* **Dónde se ve reflejada la conexión con el Testing (Líneas 42-50):**
  ```java
  public boolean validateJwtToken(String authToken) {
      try {
          Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
          return true;
      } catch (JwtException | IllegalArgumentException e) {
          // El catch captura tanto firmas inválidas como tokens vacíos
      }
      return false;
  }
  ```
* **Explicación DevOps:** Gracias a las pruebas unitarias se detectó que un token vacío lanzaba un `IllegalArgumentException`. Se implementó el control de excepciones para que el sistema responda con seguridad devolviendo `false` en lugar de tumbar la aplicación.

---

### 2.3. JaCoCo (Java Code Coverage Plugin)
* **Qué es:** Herramienta de auditoría y métricas de DevOps que mide la **cobertura de código**.
* **Dónde se ve reflejado en el código:**
  Abre [pom.xml](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/pom.xml#L101-L119):
  ```xml
  <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.12</version>
      <executions>
          <execution>
              <goals>
                  <goal>prepare-agent</goal> <!-- Inyecta el agente de monitoreo en memoria -->
              </goals>
          </execution>
          <execution>
              <id>report</id>
              <phase>test</phase> <!-- Genera el reporte HTML al terminar la fase test -->
              <goals>
                  <goal>report</goal>
              </goals>
          </execution>
      </executions>
  </plugin>
  ```
* **Dónde se ve reflejado el resultado:**
  En el archivo web generado:
  👉 **`target/site/jacoco/index.html`**

---

### 2.4. Maven Wrapper (`mvnw.cmd`)
* **Qué es:** El orquestador del ciclo de vida del proyecto.
* **Dónde se ve reflejado:** En los archivos ejecutables `mvnw` y `mvnw.cmd` en la raíz del proyecto.
* **Comando clave que invoca el ciclo:**
  ```powershell
  .\mvnw.cmd test -Dtest=JwtUtilsTest
  ```
  Este comando compila las fuentes, descarga el agente de JaCoCo, ejecuta JUnit y compila el reporte.

---

### 2.5. Pipeline Local de Automatización (`pipeline-devops-test.bat`)
* **Qué es:** Script por lotes que simula localmente el comportamiento de un servidor de Integración Continua (como Jenkins o GitLab CI).
* **Dónde se ve reflejado:** En la raíz del proyecto:
  👉 **`pipeline-devops-test.bat`**
* **Estructura por fases del script:**
  * **Línea 8 (`call .\mvnw.cmd test-compile`):** Fase de compilación (Build).
  * **Línea 18 (`call .\mvnw.cmd test -Dtest=JwtUtilsTest`):** Fase de pruebas (Test). Si falla, aborta el script (`exit /b %ERRORLEVEL%`).
  * **Línea 33 (`start target\site\jacoco\index.html`):** Fase de Quality Gate: abre el reporte de métricas en el navegador.

---

## 3. Arquitectura de Archivos (¿Dónde está cada cosa?)

Para ubicarte rápidamente durante tu presentación:

| Archivo / Carpeta | Tipo | Función |
| :--- | :--- | :--- |
| [pom.xml](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/pom.xml) | Configuración | Contiene la versión de Spring Boot (`3.2.5`), las dependencias de testing (`spring-boot-starter-test`) y el plugin de **JaCoCo**. |
| [JwtUtils.java](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/src/main/java/com/inventrack/api/security/JwtUtils.java) | Código de Producción | Componente evaluado. Contiene el método `validateJwtToken(...)`. |
| [JwtUtilsTest.java](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/src/test/java/com/inventrack/api/security/JwtUtilsTest.java) | Código de Prueba | Pruebas JUnit 5 con anotaciones `@Test`, `@BeforeEach`, `@DisplayName` y `assertFalse`. |
| [pipeline-devops-test.bat](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/pipeline-devops-test.bat) | Script de Pipeline | Automatizador en un clic del ciclo Build -> Test -> Quality Gate. |
| `target/site/jacoco/index.html` | Reporte Visual | Dashboard interactivo que muestra las métricas de cobertura de código. |

---

## 4. Recorrido Paso a Paso para la Explicación en Vivo

Sigue este orden exacto al momento de presentar:

### Paso 1: Mostrar el Código de la Prueba y las Anotaciones
* **Abre:** [JwtUtilsTest.java](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/src/test/java/com/inventrack/api/security/JwtUtilsTest.java).
* **Explica señalando el código:**
  > *"Aquí tenemos nuestras pruebas unitarias de seguridad usando **JUnit 5**:*
  > * *Señalas `@BeforeEach`: Este método prepara el entorno antes de cada prueba inyectando una clave secreta y un tiempo de expiración limpios.*
  > * *Señalas `@Test`: Marca cada caso de uso automatizado.*
  > * *Señalas `assertFalse`: Es nuestro Quality Gate. Si el método `validateJwtToken` llegara a aceptar un token vacío o corrupto, la prueba falla y detiene el proceso."*

---

### Paso 2: Ejecutar el Pipeline de Testing DevOps
* **Abre la terminal o haz doble clic sobre:** [pipeline-devops-test.bat](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/pipeline-devops-test.bat).
* **Explica mientras corre la consola:**
  > *"En DevOps no ejecutamos pruebas manualmente haciendo clics en una interfaz. Todo está automatizado a través de un Pipeline de Integración Continua. Nuestro pipeline realiza 3 fases automáticas:*
  > * **Fase 1 (Build):** Compila el código fuente para validar sintaxis y dependencias.
  > * **Fase 2 (Test):** JUnit 5 levanta los tests y JaCoCo analiza la ejecución en memoria.
  > * **Fase 3 (Quality Gate):** Si todo pasa con 0 errores, se aprueba el paso y se publica el reporte métrico."*

---

### Paso 3: Analizar el Reporte de JaCoCo (Métricas de Cobertura)
* El navegador se abrirá automáticamente en: `target/site/jacoco/index.html`.
* **Navega en pantalla:**
  1. Haz clic en el paquete `com.inventrack.api.security`.
  2. Haz clic en la clase `JwtUtils`.
  3. Haz clic en el método `validateJwtToken(...)`.
* **Explica el significado de los colores:**
  > *"Este es el reporte de Code Coverage generado por **JaCoCo**. En DevOps, las métricas son vitales:*
  > * **Verde:** Líneas de código ejecutadas y verificadas por las pruebas automatizadas.
  > * **Amarillo:** Bifurcaciones (condicionales `if/catch`) evaluadas parcialmente.
  > * **Rojo:** Código que nunca fue ejecutado por las pruebas (riesgo técnico potencial).
  > *Este reporte permite fijar un **Quality Gate**: si un equipo no alcanza un porcentaje mínimo (por ejemplo 80%), el pipeline rechaza el pase a producción."*

---

### Paso 4: La Demostración Estrella (Demostrar el "Fail Fast" en vivo)
Para demostrar que el pipeline **realmente protege** el sistema:

1. Abre [JwtUtilsTest.java](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/src/test/java/com/inventrack/api/security/JwtUtilsTest.java#L26).
2. En la línea 26, cambia intencionalmente:
   ```java
   // De esto:
   assertFalse(esValido, "Un token vacío debe ser rechazado inmediatamente");

   // A esto (error forzado):
   assertTrue(esValido, "Un token vacío debe ser rechazado inmediatamente");
   ```
3. Vuelve a ejecutar [pipeline-devops-test.bat](file:///c:/Users/PERSONAL/Downloads/INVENTRACK-Backend/pipeline-devops-test.bat).
4. **Resultado en pantalla:**
   * La consola se pintará en **color rojo**.
   * Se mostrará el mensaje: `[ERROR CRITICO DEVOPS] Una o mas pruebas fallaron. Quality Gate RECHAZADO. El codigo NO es apto para continuar a Release/Deploy.`
   * El pipeline **aborta de inmediato**, no abre el reporte y no permite continuar al empaquetado.
5. **Qué decir al público:**
   > *"Esto es exactamente lo que busca DevOps: **Fail Fast**. Un desarrollador cometió un error o alteró una regla de negocio. El pipeline impidió que el código defectuoso avanzara a producción, protegiendo la integridad y seguridad del sistema."*
6. Vuelve a dejar `assertFalse` en la prueba, vuelve a ejecutar el `.bat` y muestra cómo el pipeline vuelve a pasar con éxito en **verde**.

---

## 5. Resumen de Respuestas Rápidas para Preguntas del Profesor

* **¿Por qué usamos JUnit 5 y no pruebas manuales?**
  Porque las pruebas manuales no escalan, consumen tiempo humano y son propensas a descuidos. JUnit permite automatizar cientos de pruebas en milisegundos.
* **¿Qué aporta JaCoCo a DevOps?**
  Aporta visibilidad y objetividad mediante métricas. Permite saber exactamente qué partes del sistema están blindadas y cuáles son vulnerables por falta de pruebas.
* **¿Por qué se llama Continuous Testing?**
  Porque no es una etapa aislada al final del año o del mes: las pruebas se ejecutan de manera ininterrumpida cada vez que se compila una versión del software.
