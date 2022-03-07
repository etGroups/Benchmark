<?php

use Swoole\Http\Request;
use Swoole\Http\Response;
use Swoole\WebSocket\Frame;
use Swoole\WebSocket\Server;

$config  = [
	'host' => 'db',
	'user' => getenv('MYSQL_ROOT'),
	'password' => getenv('MYSQL_ROOT_PASSWORD'),
	'database' => 'general'
];

try {
	$db = new PDO("mysql:host={$config['host']};dbname={$config['database']};charset=utf8", $config['user'],
		$config['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $error) {
	echo $error->getMessage();
	exit('Database error');
}

function getCustomers()
{
	try {
		global $db;
		$customers = [];
		$sql = "SELECT * FROM `CUSTOMER` LIMIT 10";
		$query = $db->query($sql);
		while ($customer = $query->fetch(PDO::FETCH_ASSOC)) {
			$customers[] = $customer;
		}
		return json_encode($customers);
	} catch (PDOException $error) {
		echo $error->getMessage();
		exit('Database error');
	}
}

$server = new Server("0.0.0.0", 80);

$server->on("Start", function(Server $server)
{
	echo "Swoole Server is started";
});

$server->on('Open', function(Server $server, Request $request)
{
	echo "connection open: {$request->fd}\n";
});

$server->on("Request", function(Request $request, Response $response)
{
	$response->header("Content-Type", "text/plain");
	match ($request->server['request_uri']) {
		'/HelloHTTP' => $response->end("Hello World"),
		'/PongHTTP' =>  $response->end($request->getContent()),
		'/SqlHTTP' => $response->end(getCustomers()),
		default => $response->end("Hello PHP"),
	};
});

$server->on('Message', function(Server $server, Frame $frame)
{
	match ($frame->data) {
		'HelloWS' => $server->push($frame->fd, "Hello World"),
		'PongWS' =>  $server->push($frame->fd, $frame->data),
		'SqlWS' => $server->push($frame->fd, getCustomers()),
		default => $server->push($frame->fd, "Hello PHP"),
	};
});

$server->on('Close', function(Server $server, int $fd)
{
	echo "connection close: {$fd}\n";
});

$server->on('Disconnect', function(Server $server, int $fd)
{
	echo "connection disconnect: {$fd}\n";
});

$server->start();