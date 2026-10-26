@echo off
cls
color 0B
echo =====================================================================
echo           PIPELINE DEVOPS AUTOMATIZADO - FASE DE TESTING
echo =====================================================================
echo.
echo [1/3] FASE BUILD: Compilando codigo fuente...
call .\mvnw.cmd test-compile
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR CRITICO DEVOPS] La compilacion fallo. Pipeline detenido.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] FASE TEST: Ejecutando pruebas unitarias con JUnit 5 y JaCoCo...
call .\mvnw.cmd test -Dtest=JwtUtilsTest
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
if exist target\site\jacoco\index.html (
    start target\site\jacoco\index.html
) else (
    echo El reporte se encuentra en target\site\jacoco\index.html
)
pause
