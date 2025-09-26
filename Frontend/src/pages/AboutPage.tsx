import React from 'react';

export default function AboutPage() {
  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h1 className="mb-3">About ShowDownShare</h1>
        <p>
          <b>ShowDownShare</b> is a modern file sharing platform for poker hand histories. The goal is to make mass data analysis accessible to all players, not just coaches with huge databases.
        </p>
        <ul>
          <li>Share your hand histories anonymously with the community.</li>
          <li>Download hand histories from others after you have contributed your own.</li>
          <li>Use the data for your own analysis, training, or tool development.</li>
          <li>All uploads are reviewed by admins to ensure data quality.</li>
        </ul>
        <p>
          <b>How does it work?</b>
        </p>
        <ol>
          <li>Register for free.</li>
          <li>Upload your own hand histories as a ZIP file.</li>
          <li>After approval, you can download the collected hand histories of others.</li>
        </ol>
        <p className="text-muted mt-3" style={{fontSize:15}}>
          The platform is under active development. If you have any kind of questions or problems, send an email to showdownshare.service@gmail.com. Feedback and feature requests are welcome!
        </p>
      </div>
    </div>
  );
}
