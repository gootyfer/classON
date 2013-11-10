#include <gst/gst.h>
#include <glib.h>
#include <string.h>

static gboolean
bus_call (GstBus     *bus,
          GstMessage *msg,
          gpointer    data)
{
  GMainLoop *loop = (GMainLoop *) data;
  char *src = GST_MESSAGE_SRC_NAME(msg);
  
  switch (GST_MESSAGE_TYPE (msg)) {

  case GST_MESSAGE_EOS:
    g_print ("..[bus].. (%s) :: End of stream\n", src);
    g_main_loop_quit (loop);
    break;

  case GST_MESSAGE_ERROR: {
    gchar  *debug;
    GError *error;
    
    gst_message_parse_error (msg, &error, &debug);
    g_free (debug);
    
    g_printerr ("..[bus].. (%s) :: Error: %s\n", src, error->message);
    g_error_free (error);

    g_main_loop_quit (loop);
    break;
  }
  default: {
    g_print ("..[bus].. %15s :: %-15s\n", src, GST_MESSAGE_TYPE_NAME(msg));
    break;
  }
  }

  return TRUE;
}

static gboolean
quit_loop (GMainLoop *loop)
{
  g_main_loop_quit (loop);

  /* call me again */
  return TRUE;
}

int
main (int   argc,
      char *argv[])
{
  GMainLoop *loop;

  GstElement *pipeline, *source, *conv, *tee;
  GstElement *encoder, *oggmux, *sink1, *sink2;
  GstElement *queue1, *queue2;
  GstBus *bus;

  /* Initialisation */
  gst_init (&argc, &argv);

  loop = g_main_loop_new (NULL, FALSE);


  /* Check input arguments */
  if (argc != 2) {
    g_printerr ("Usage: %s <Ogg/Vorbis filename>\n", argv[0]);
    return -1;
  }


  /* Create gstreamer elements */
  pipeline = gst_pipeline_new ("idiotizador");
  source   = gst_element_factory_make ("osxaudiosrc", "audio-source");
  conv     = gst_element_factory_make ("audioconvert",  "converter");
  tee  = gst_element_factory_make ("tee",     "cloner");


  encoder  = gst_element_factory_make ("vorbisenc",     "vorbis-encoder");
  oggmux   = gst_element_factory_make ("oggmux",     "ogg-muxer");
  sink1     = gst_element_factory_make ("filesink", "filesink");
  
  sink2     = gst_element_factory_make ("autoaudiosink", "audiosink");

  queue1     = gst_element_factory_make ("queue", "queue1");
  queue2     = gst_element_factory_make ("queue", "queue2");

  if (!pipeline || !source || !conv || !tee || !encoder || !oggmux || !sink1 || !sink2) {
    g_printerr ("One element could not be created. Exiting.\n");
    return -1;
  }

  /* Set up the pipeline */

  /* we set the input filename to the source element */
  g_object_set (G_OBJECT (sink1), "location", argv[1], NULL);
  g_object_set (G_OBJECT (queue2), "min-threshold-time", 500000000, NULL);

  /* we add a message handler */
  bus = gst_pipeline_get_bus (GST_PIPELINE (pipeline));
  gst_bus_add_watch (bus, bus_call, loop);
  gst_object_unref (bus);

  /* we add all elements into the pipeline */
  /* file-source | ogg-demuxer | vorbis-decoder | converter | alsa-output */
  gst_bin_add_many (GST_BIN (pipeline),
                    source, conv, tee, queue1, encoder, oggmux, sink1, queue2, sink2, NULL);

  /* we link the elements together */
  /* file-source -> ogg-demuxer ~> vorbis-decoder -> converter -> alsa-output */
  gst_element_link_many (source, conv, tee, NULL);
  gst_element_link_many (tee, queue1, encoder, oggmux, sink1, NULL);
  gst_element_link_many (tee, queue2, sink2, NULL);


  /* note that the demuxer will be linked to the decoder dynamically.
     The reason is that Ogg may contain various streams (for example
     audio and video). The source pad(s) will be created at run time,
     by the demuxer when it detects the amount and nature of streams.
     Therefore we connect a callback function which will be executed
     when the "pad-added" is emitted.*/


  /* Set the pipeline to "playing" state*/
  g_print ("Saving to file: %s\n", argv[1]);
  gst_element_set_state (pipeline, GST_STATE_PLAYING);


  /* Iterate */
  g_timeout_add (7000, (GSourceFunc) quit_loop, loop);
  g_print ("Running...\n");
  g_main_loop_run (loop);


  /* Out of the main loop, clean up nicely */
  g_print ("Returned, stopping playback\n");
  gst_element_set_state (pipeline, GST_STATE_NULL);

  g_print ("Deleting pipeline\n");
  gst_object_unref (GST_OBJECT (pipeline));

  return 0;
}
