const path = require('path');
const fs = require('fs');
const JSON5 = require('json5');

const nodeResolve = require('eslint-import-resolver-node').resolve;

/* eslint-disable no-console */
const babelRootImport = require('babel-root-import/build/helper.js');

// newer version of babel root import exports the 2 functions
// but older versions exported a class
/* eslint-disable new-cap */
const babelRootImportObj = babelRootImport.default ?
    new babelRootImport.default() : babelRootImport;

const defaultConfig = {
    rootPathSuffix: '',
    rootPathPrefix: '~'
};

let {
    hasRootPathPrefixInString,
    transformRelativeToRootPath
} = babelRootImportObj;

if (babelRootImport.default) {
    /* eslint-disable no-console */
    hasRootPathPrefixInString = hasRootPathPrefixInString.bind(babelRootImportObj);
    transformRelativeToRootPath = transformRelativeToRootPath.bind(babelRootImportObj);
}

function loadBabelConfig(config = {}) {
    const pluginConfig = (config.plugins || []).find(p => {
        if (Array.isArray(p)) {
            return p[0] === 'babel-plugin-root-import';
        }
        return p === 'babel-plugin-root-import';
    });
    if (Array.isArray(pluginConfig)) {
        if (Array.isArray(pluginConfig[1])) {
            return pluginConfig[1].map(conf => Object.assign({}, defaultConfig, conf));
        }
        return [Object.assign({}, defaultConfig, pluginConfig[1])];
    }
    return [defaultConfig];
}

// returns the root import config as an object
function getConfigFromBabel(start, babelrc = '.babelrc') {
    if (start === '/') return [];

    const packageJSONPath = path.join(start, 'package.json');
    const packageJSON = require(packageJSONPath); // eslint-disable-line global-require
    const babelConfig = packageJSON.babel;

    if (babelConfig) {
        const pluginConfig = loadBabelConfig(babelConfig);
        process.chdir(path.dirname(packageJSONPath));
        return pluginConfig;
    }

    const babelrcPath = path.join(start, babelrc);
    if (fs.existsSync(babelrcPath)) {
        const babelrcJson = JSON5.parse(fs.readFileSync(babelrcPath, 'utf8'));
        if (babelrcJson) {
            const pluginConfig = loadBabelConfig(babelrcJson);
            // The src path inside babelrc are from the root so we have
            // to change the working directory for the same directory
            // to make the mapping to work properly
            process.chdir(path.dirname(babelrcPath));
            return pluginConfig;
        }
    }
    return getConfigFromBabel(path.dirname(start));
}

exports.interfaceVersion = 2;

/**
 * Find the full path to 'source', given 'file' as a full reference path.
 *
 * resolveImport('./foo', '/Users/ben/bar.js') => '/Users/ben/foo.js'
 * @param  {string} source - the module to resolve; i.e './some-module'
 * @param  {string} file - the importing file's full path; i.e. '/usr/local/bin/file.js'
 * @param  {object} config - the resolver options
 * @param  {string} babelrc - the name of the babelrc file
 * @return {object}
 */
exports.resolve = (source, file, config, babelrc) => {
    const opts = getConfigFromBabel(process.cwd(), babelrc);

    // [{rootPathPrefix: rootPathSuffix}]
    const rootPathConfig = [];

    if (Array.isArray(opts)) {
        opts.forEach((option) => {
            let prefix = '';
            if (option.rootPathPrefix && typeof option.rootPathPrefix === 'string') {
                prefix = option.rootPathPrefix;
            }

            let suffix = '';
            if (option.rootPathSuffix && typeof option.rootPathSuffix === 'string') {
                suffix = `/${option.rootPathSuffix.replace(/^(\/)|(\/)$/g, '')}`;
            }

            rootPathConfig.push({
                rootPathPrefix: prefix,
                rootPathSuffix: suffix
            });
        });
    }

    let transformedSource = source;
    for (let i = 0; i < rootPathConfig.length; i += 1) {
        const option = rootPathConfig[i];
        const prefix = option.rootPathPrefix;
        const suffix = option.rootPathSuffix;
        if (hasRootPathPrefixInString(source, option.rootPathPrefix)) {
            transformedSource = transformRelativeToRootPath(source, suffix, prefix);
            break;
        }
    }

    return nodeResolve(transformedSource, file, config);
};

