# Script tự động tạo dự án Java
# Sử dụng: .\create-java-project.ps1 -ProjectName "MyProject" -PackageName "com.example.myproject"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$false)]
    [string]$PackageName = "com.example.app",
    
    [Parameter(Mandatory=$false)]
    [string]$JavaVersion = "17",
    
    [Parameter(Mandatory=$false)]
    [switch]$UseGradle = $false
)

Write-Host "🚀 Tạo dự án Java: $ProjectName" -ForegroundColor Green

# Tạo thư mục dự án
New-Item -ItemType Directory -Path $ProjectName -Force | Out-Null
Set-Location $ProjectName

Write-Host "📁 Tạo cấu trúc thư mục..." -ForegroundColor Yellow

# Tạo cấu trúc thư mục
$packagePath = $PackageName.Replace(".", "\")
$packageDir = "src\main\java\$packagePath"
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null
New-Item -ItemType Directory -Path "src\main\resources" -Force | Out-Null
$testPackageDir = "src\test\java\$packagePath"
New-Item -ItemType Directory -Path $testPackageDir -Force | Out-Null
New-Item -ItemType Directory -Path "src\test\resources" -Force | Out-Null
New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null

Write-Host "📝 Tạo file cấu hình..." -ForegroundColor Yellow

# Tạo Main.java
$mainClass = @"
package $PackageName;

/**
 * Main class for the $ProjectName application
 */
public class Main {
    
    /**
     * Main method - entry point of the application
     * @param args command line arguments
     */
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to $ProjectName!");
        
        // Example of using command line arguments
        if (args.length > 0) {
            System.out.println("Arguments provided:");
            for (int i = 0; i < args.length; i++) {
                System.out.println("  " + (i + 1) + ": " + args[i]);
            }
        } else {
            System.out.println("No arguments provided.");
        }
    }
}
"@

$mainClass | Out-File -FilePath "$packageDir\Main.java" -Encoding UTF8

# Tạo MainTest.java
$testClass = @"
package $PackageName;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for Main
 */
public class MainTest {
    
    @Test
    public void testMainMethod() {
        assertDoesNotThrow(() -> {
            Main.main(new String[]{"test"});
        });
    }
    
    @Test
    public void testMainMethodWithNoArgs() {
        assertDoesNotThrow(() -> {
            Main.main(new String[]{});
        });
    }
}
"@

$testClass | Out-File -FilePath "$testPackageDir\MainTest.java" -Encoding UTF8

# Tạo pom.xml (Maven)
$pomContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>$PackageName</groupId>
    <artifactId>$($ProjectName.ToLower())</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>$ProjectName</name>
    <description>A Java application</description>

    <properties>
        <maven.compiler.source>$JavaVersion</maven.compiler.source>
        <maven.compiler.target>$JavaVersion</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.9.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>$JavaVersion</source>
                    <target>$JavaVersion</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.0.0</version>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.4.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>$PackageName.Main</mainClass>
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
"@

$pomContent | Out-File -FilePath "pom.xml" -Encoding UTF8

# Tạo build.gradle nếu được yêu cầu
if ($UseGradle) {
    $gradleContent = @"
plugins {
    id 'java'
    id 'application'
}

group = '$PackageName'
version = '1.0.0'
sourceCompatibility = '$JavaVersion'

repositories {
    mavenCentral()
}

dependencies {
    testImplementation 'org.junit.jupiter:junit-jupiter:5.9.2'
}

application {
    mainClass = '$PackageName.Main'
}

test {
    useJUnitPlatform()
}

jar {
    manifest {
        attributes 'Main-Class': '$PackageName.Main'
    }
}
"@
    $gradleContent | Out-File -FilePath "build.gradle" -Encoding UTF8
}

# Tạo .gitignore
$gitignoreContent = @"
# Compiled class file
*.class

# Log file
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files #
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# virtual machine crash logs
hs_err_pid*
replay_pid*

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# Gradle
.gradle
build/
gradle-app.setting
!gradle-wrapper.jar
!gradle-wrapper.properties

# IDE
.vscode/
.idea/
*.iml
*.ipr
*.iws
"@

$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8

# Tạo VS Code config
$vscodeSettings = @"
{
    "java.configuration.updateBuildConfiguration": "automatic",
    "java.compile.nullAnalysis.mode": "automatic",
    "java.debug.settings.onBuildFailureProceed": true,
    "java.test.config": {
        "workingDirectory": "`${workspaceFolder}"
    },
    "java.project.sourcePaths": [
        "src/main/java"
    ],
    "java.project.outputPath": "bin",
    "java.project.referencedLibraries": [
        "lib/**/*.jar"
    ]
}
"@

$vscodeSettings | Out-File -FilePath ".vscode\settings.json" -Encoding UTF8

$vscodeLaunch = @"
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "java",
            "name": "Launch Main",
            "request": "launch",
            "mainClass": "$PackageName.Main",
            "projectName": "$($ProjectName.ToLower())",
            "args": "",
            "vmArgs": "",
            "console": "integratedTerminal"
        }
    ]
}
"@

$vscodeLaunch | Out-File -FilePath ".vscode\launch.json" -Encoding UTF8

# Tạo README
$readmeContent = @"
# $ProjectName

Một dự án Java được tạo tự động.

## Cách chạy

### Maven
```bash
mvn compile
mvn exec:java -Dexec.mainClass="$PackageName.Main"
mvn test
mvn package
```

### Gradle (nếu có)
```bash
gradle build
gradle run
gradle test
```

## Cấu trúc dự án
- `src/main/java/` - Source code chính
- `src/test/java/` - Test code
- `src/main/resources/` - Resources
- `src/test/resources/` - Test resources
"@

$readmeContent | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host "Dự án $ProjectName đã được tạo thành công!" -ForegroundColor Green
Write-Host "Thư mục: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Để chạy: cd $ProjectName && mvn compile && mvn exec:java" -ForegroundColor Yellow
