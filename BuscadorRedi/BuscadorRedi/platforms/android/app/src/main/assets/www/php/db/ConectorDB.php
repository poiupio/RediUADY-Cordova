<?php

class ConectorDB{
	private $mysqli_connection;
    private static $_instance = null;
    private $dataBaseUser = "root";
    private $dataBasePassword = "4dm1n.p05";
    private $dataBaseHost = "localhost";
    private $dataBaseName = "dspace_movil";

    private function __construct(){
        $this->mysqli_connection = new mysqli(
            $this->dataBaseHost,
            $this->dataBaseUser,
            $this->dataBasePassword,
            $this->dataBaseName
        );
        $this->mysqli_connection->set_charset("utf8");
        if($this->mysqli_connection->connect_errno){
            echo "Fallo al conectar a la base de datos: ".$this->mysqli_connection->connect_errno;
        }
    }

    public static function getInstance(){
        if(self::$_instance == null){
            self::$_instance = new ConectorDB();
        }
        return self::$_instance;
    }

    final public function __clone() {
        throw new Exception('Nope.');
    }

    public function query($query){
        $response = $this->mysqli_connection->query($query);
        $id = $this->mysqli_connection->insert_id;
        return $id;
    }

}