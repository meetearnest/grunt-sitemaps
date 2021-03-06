/*
 * grunt-sitemaps
 * https://github.com/chager/grunt-sitemaps
 *
 * Copyright (c) 2014 Christian Hager
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var path = require('path');
    var fs = require('fs');

    grunt.registerMultiTask('sitemaps', 'A Grunt plugin to automate the creation of sitemaps', function () {

        var xmlsitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlsitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            changefreq: 'daily',
            priority: '0.5',
            removeFileExtensions: false,
            mapIndexFilesToFolders: true,
            priorities: {}
        });

        if (!options.baseUrl) {
            grunt.fail.fatal('Could not generate sitemap. Missing parameter baseurl.', 3);
        }

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            xmlsitemap += f.src.filter(function (filepath) {

                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else if (grunt.file.isDir(filepath)) {
                    return false;
                } else if(filepath.match(/.*404\.(php|html)/i)){
                    return false;
                }else {
                    return true;
                }

            }).map(function (filepath) {

                var url = filepath;
                if(options.contentRoot){
                    var root = new RegExp('^' + options.contentRoot);
                    url=url.replace(root,'');
                }
                var path = url;
                url = options.baseUrl.concat(url);
                if(options.mapIndexFilesToFolders){
                    url=url.replace(/(.*)\/index\.(php|html)$/i, '$1/');
                    path=path.replace(/(.*)\/index\.(php|html)$/i, '$1/');
                }
                if(options.removeFileExtensions){
                    //url = url.slice(0, url.lastIndexOf('.'));
                    url = url.replace(/\.[^\/.]+$/i,'');
                    path = path.replace(/\.[^\/.]+$/i,'');
                }

                // Determine priority
                var priority = options.priorities[path] || options.priority;

                grunt.verbose.writeln('Adding url: ' + url);
                var mtime = new Date((fs.statSync(filepath).mtime).getTime()).toISOString();
                var xml = '\t<url>\n';
                xml += '\t\t<loc>' + url + '</loc>\n';
                xml += '\t\t<lastmod>' + mtime + '</lastmod>\n';
                xml += '\t\t<changefreq>' + options.changefreq + '</changefreq>\n';
                xml += '\t\t<priority>' + priority + '</priority>\n';
                xml += '\t</url>\n';

                return xml;
            });
        });

        xmlsitemap += '</urlset>';

        // Write the destination file.
        var destFile = path.join(options.dest, 'sitemap.xml');
        grunt.file.write(destFile, xmlsitemap);

        // Print a success message.
        grunt.log.writeln('Successfully created ' + destFile);
    });
};
