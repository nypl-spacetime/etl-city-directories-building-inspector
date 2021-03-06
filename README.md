# NYC Space/Time Directory ETL module: City Directories & Building Inspector

[ETL](https://en.wikipedia.org/wiki/Extract,_transform,_load) module for NYPL's [NYC Space/Time Direcory](http://spacetime.nypl.org/). This Node.js module downloads, parses, and/or transforms City Directories & Building Inspector data, and creates a NYC Space/Time Directory dataset.

## Details

<table>
<tbody>

<tr>
<td>ID</td>
<td><code>city-directories-building-inspector</code></td>
</tr>

<tr>
<td>Title</td>
<td>City Directories & Building Inspector</td>
</tr>

<tr>
<td>Description</td>
<td>City Directories & Building Inspector</td>
</tr>

<tr>
<td>License</td>
<td>CC0</td>
</tr>

<tr>
<td>Author</td>
<td>Bert Spaan</td>
</tr>
</tbody>
</table>

## Available steps

  - `transform`

## Usage

```
git clone https://github.com/nypl-spacetime/etl-city-directories-building-inspector.git /path/to/etl-modules
cd /path/to/etl-modules/etl-city-directories-building-inspector
npm install

spacetime-etl city-directories-building-inspector[.<step>]
```

See http://github.com/nypl-spacetime/spacetime-etl for information about Space/Time's ETL tool. More Space/Time ETL modules [can be found on GitHub](https://github.com/search?utf8=%E2%9C%93&q=org%3Anypl-spacetime+etl-&type=Repositories&ref=advsearch&l=&l=).

# Data

The dataset created by this ETL module's `transform` step can be found in the [data section of the NYC Space/Time Directory website](http://spacetime.nypl.org/#data-city-directories-building-inspector).

_This README file is generated by [generate-etl-readme](https://github.com/nypl-spacetime/generate-etl-readme)._
