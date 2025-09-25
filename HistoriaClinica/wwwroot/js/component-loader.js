/**
 * Sistema de carga de componentes para Historia Clínica
 * Permite cargar componentes HTML de forma dinámica y modular
 */

class ComponentLoader {
    constructor() {
        this.loadedComponents = new Map();
        this.componentCache = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Carga un componente HTML desde un archivo
     */
    async loadComponent(componentPath, containerId = null) {
        // Verificar si ya está cargado
        if (this.loadedComponents.has(componentPath)) {
            return this.loadedComponents.get(componentPath);
        }

        // Verificar si ya está cargando
        if (this.loadingPromises.has(componentPath)) {
            return this.loadingPromises.get(componentPath);
        }

        // Crear promesa de carga
        const loadPromise = this._loadComponentFile(componentPath, containerId);
        this.loadingPromises.set(componentPath, loadPromise);

        try {
            const result = await loadPromise;
            this.loadedComponents.set(componentPath, result);
            this.loadingPromises.delete(componentPath);
            return result;
        } catch (error) {
            this.loadingPromises.delete(componentPath);
            throw error;
        }
    }

    /**
     * Carga múltiples componentes en paralelo
     */
    async loadComponents(components) {
        const promises = components.map(component => {
            if (typeof component === 'string') {
                return this.loadComponent(component);
            } else {
                return this.loadComponent(component.path, component.containerId);
            }
        });

        return Promise.all(promises);
    }

    /**
     * Carga un componente en un contenedor específico
     */
    async loadComponentInContainer(componentPath, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Contenedor con ID '${containerId}' no encontrado`);
        }

        try {
            const componentHTML = await this._fetchComponent(componentPath);
            container.innerHTML = componentHTML;
            
            // Ejecutar scripts del componente
            this._executeComponentScripts(container);
            
            return {
                path: componentPath,
                containerId,
                html: componentHTML,
                container
            };
        } catch (error) {
            console.error(`Error cargando componente ${componentPath}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el HTML de un componente sin insertarlo en el DOM
     */
    async getComponentHTML(componentPath) {
        return this._fetchComponent(componentPath);
    }

    /**
     * Carga un componente y lo inserta en el DOM
     */
    async insertComponent(componentPath, targetElement, position = 'beforeend') {
        const target = typeof targetElement === 'string' 
            ? document.querySelector(targetElement) 
            : targetElement;
        
        if (!target) {
            throw new Error(`Elemento objetivo no encontrado: ${targetElement}`);
        }

        try {
            const componentHTML = await this._fetchComponent(componentPath);
            target.insertAdjacentHTML(position, componentHTML);
            
            // Ejecutar scripts del componente
            this._executeComponentScripts(target);
            
            return {
                path: componentPath,
                target,
                html: componentHTML
            };
        } catch (error) {
            console.error(`Error insertando componente ${componentPath}:`, error);
            throw error;
        }
    }

    /**
     * Carga un componente y lo reemplaza en el DOM
     */
    async replaceComponent(componentPath, targetElement) {
        const target = typeof targetElement === 'string' 
            ? document.querySelector(targetElement) 
            : targetElement;
        
        if (!target) {
            throw new Error(`Elemento objetivo no encontrado: ${targetElement}`);
        }

        try {
            const componentHTML = await this._fetchComponent(componentPath);
            target.innerHTML = componentHTML;
            
            // Ejecutar scripts del componente
            this._executeComponentScripts(target);
            
            return {
                path: componentPath,
                target,
                html: componentHTML
            };
        } catch (error) {
            console.error(`Error reemplazando componente ${componentPath}:`, error);
            throw error;
        }
    }

    /**
     * Carga un componente desde caché o archivo
     */
    async _loadComponentFile(componentPath, containerId) {
        try {
            const componentHTML = await this._fetchComponent(componentPath);
            
            let result = {
                path: componentPath,
                html: componentHTML
            };

            if (containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = componentHTML;
                    this._executeComponentScripts(container);
                    result.container = container;
                    result.containerId = containerId;
                }
            }

            return result;
        } catch (error) {
            console.error(`Error cargando componente ${componentPath}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el contenido HTML del componente
     */
    async _fetchComponent(componentPath) {
        // Verificar caché
        if (this.componentCache.has(componentPath)) {
            return this.componentCache.get(componentPath);
        }

        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            
            // Guardar en caché
            this.componentCache.set(componentPath, html);
            
            return html;
        } catch (error) {
            console.error(`Error obteniendo componente ${componentPath}:`, error);
            throw error;
        }
    }

    /**
     * Ejecuta los scripts de un componente
     */
    _executeComponentScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            try {
                // Crear nuevo script
                const newScript = document.createElement('script');
                
                // Copiar atributos
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                
                // Copiar contenido
                newScript.textContent = script.textContent;
                
                // Insertar en el head
                document.head.appendChild(newScript);
                
                // Remover el script original
                script.remove();
            } catch (error) {
                console.error('Error ejecutando script del componente:', error);
            }
        });
    }

    /**
     * Limpia el caché de componentes
     */
    clearCache() {
        this.componentCache.clear();
        this.loadedComponents.clear();
        this.loadingPromises.clear();
    }

    /**
     * Obtiene información sobre los componentes cargados
     */
    getLoadedComponents() {
        return Array.from(this.loadedComponents.keys());
    }

    /**
     * Verifica si un componente está cargado
     */
    isComponentLoaded(componentPath) {
        return this.loadedComponents.has(componentPath);
    }

    /**
     * Carga un componente con configuración avanzada
     */
    async loadComponentWithConfig(config) {
        const {
            path,
            containerId,
            target,
            position = 'beforeend',
            replace = false,
            onLoad = null,
            onError = null
        } = config;

        try {
            let result;
            
            if (containerId) {
                result = await this.loadComponentInContainer(path, containerId);
            } else if (target) {
                if (replace) {
                    result = await this.replaceComponent(path, target);
                } else {
                    result = await this.insertComponent(path, target, position);
                }
            } else {
                result = await this.loadComponent(path);
            }

            if (onLoad) {
                onLoad(result);
            }

            return result;
        } catch (error) {
            if (onError) {
                onError(error);
            }
            throw error;
        }
    }

    /**
     * Carga componentes de forma secuencial
     */
    async loadComponentsSequentially(components) {
        const results = [];
        
        for (const component of components) {
            try {
                const result = await this.loadComponent(component.path, component.containerId);
                results.push(result);
            } catch (error) {
                console.error(`Error cargando componente ${component.path}:`, error);
                results.push({ error, path: component.path });
            }
        }
        
        return results;
    }

    /**
     * Carga componentes con dependencias
     */
    async loadComponentsWithDependencies(components) {
        const dependencyGraph = this._buildDependencyGraph(components);
        const loadOrder = this._topologicalSort(dependencyGraph);
        
        const results = [];
        for (const componentPath of loadOrder) {
            try {
                const result = await this.loadComponent(componentPath);
                results.push(result);
            } catch (error) {
                console.error(`Error cargando componente ${componentPath}:`, error);
                results.push({ error, path: componentPath });
            }
        }
        
        return results;
    }

    /**
     * Construye el grafo de dependencias
     */
    _buildDependencyGraph(components) {
        const graph = new Map();
        
        components.forEach(component => {
            const path = component.path || component;
            const dependencies = component.dependencies || [];
            graph.set(path, dependencies);
        });
        
        return graph;
    }

    /**
     * Ordenamiento topológico para resolver dependencias
     */
    _topologicalSort(graph) {
        const visited = new Set();
        const visiting = new Set();
        const result = [];
        
        const visit = (node) => {
            if (visiting.has(node)) {
                throw new Error(`Dependencia circular detectada: ${node}`);
            }
            
            if (visited.has(node)) {
                return;
            }
            
            visiting.add(node);
            
            const dependencies = graph.get(node) || [];
            dependencies.forEach(dep => visit(dep));
            
            visiting.delete(node);
            visited.add(node);
            result.push(node);
        };
        
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                visit(node);
            }
        }
        
        return result;
    }
}

// Instancia global del cargador de componentes
window.componentLoader = new ComponentLoader();

// Funciones de conveniencia
window.loadComponent = (path, containerId) => window.componentLoader.loadComponent(path, containerId);
window.loadComponents = (components) => window.componentLoader.loadComponents(components);
window.loadComponentInContainer = (path, containerId) => window.componentLoader.loadComponentInContainer(path, containerId);
window.insertComponent = (path, target, position) => window.componentLoader.insertComponent(path, target, position);
window.replaceComponent = (path, target) => window.componentLoader.replaceComponent(path, target);

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}

